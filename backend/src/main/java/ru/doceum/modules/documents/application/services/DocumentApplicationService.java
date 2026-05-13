package ru.doceum.modules.documents.application.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.doceum.common.ports.auth.UserPort;
import ru.doceum.common.ports.auth.UserInfo;
import ru.doceum.modules.documents.application.dto.*;
import ru.doceum.modules.documents.domain.models.Document;
import ru.doceum.modules.documents.domain.models.DocumentStatus;
import ru.doceum.modules.documents.domain.models.Publication;
import ru.doceum.modules.documents.domain.repositories.DocumentRepository;
import ru.doceum.modules.documents.domain.repositories.PublicationRepository;
import ru.doceum.modules.documents.infrastructure.services.DoceoGenerator;
import ru.doceum.modules.documents.infrastructure.services.DoceoParser;
import ru.doceum.modules.documents.infrastructure.services.DoceoSigner;
import ru.doceum.modules.documents.infrastructure.storage.FileStorageService;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentApplicationService {

    private final DocumentRepository documentRepository;
    private final PublicationRepository publicationRepository;
    private final FileStorageService fileStorageService;
    private final DoceoGenerator doceoGenerator;
    private final DoceoParser doceoParser;
    private final DoceoSigner doceoSigner;
    private final UserPort userPort;

    @Transactional
    public UUID createDocument(UUID authorId, CreateDocumentRequest request) {
        UUID documentId = UUID.randomUUID();

        // Генерируем минимальный .doceo
        byte[] minimalDoceo = doceoGenerator.generateMinimal(request.getTitle(), documentId);

        // Сохраняем файл
        String filePath = fileStorageService.saveDraft(authorId, documentId, minimalDoceo);
        String contentSha256 = doceoParser.calculateContentSha256(minimalDoceo);

        // Создаём запись в БД
        Document document = Document.createNew(
                documentId, authorId, request.getTitle(), request.getDescription(),
                filePath, contentSha256
        );

        documentRepository.save(document);

        return documentId;
    }

    @Transactional
    public void saveDraft(UUID documentId, UUID userId, MultipartFile file) {
        Document document = documentRepository.findByIdAndAuthorId(documentId, userId)
                .orElseThrow(() -> new RuntimeException("Document not found or access denied"));

        // Валидируем .doceo
        doceoParser.validate(file.getBytes());

        // Сохраняем файл (перезаписываем)
        String filePath = fileStorageService.saveDraft(userId, documentId, file.getBytes());
        String contentSha256 = doceoParser.calculateContentSha256(file.getBytes());

        // Обновляем документ (title и description пока не меняем, только файл)
        // Для MVP title/description отдельно не редактируются отдельным эндпоинтом
        document.updateDraft(
                document.getTitle(),
                document.getDescription(),
                filePath,
                contentSha256
        );

        documentRepository.save(document);
    }

    public byte[] getDraftFile(UUID documentId, UUID userId) {
        Document document = documentRepository.findByIdAndAuthorId(documentId, userId)
                .orElseThrow(() -> new RuntimeException("Document not found or access denied"));

        return fileStorageService.loadFile(document.getFilePath());
    }

    @Transactional
    public void deleteDocument(UUID documentId, UUID userId) {
        Document document = documentRepository.findByIdAndAuthorId(documentId, userId)
                .orElseThrow(() -> new RuntimeException("Document not found or access denied"));

        // Удаляем публикацию, если есть
        publicationRepository.deleteByDocumentId(documentId);

        // Архивируем документ
        document.archive();
        documentRepository.save(document);

        // Файл не удаляем (оставляем для восстановления админом)
    }

    @Transactional
    public void publish(UUID documentId, UUID userId) {
        Document document = documentRepository.findByIdAndAuthorId(documentId, userId)
                .orElseThrow(() -> new RuntimeException("Document not found or access denied"));

        // Загружаем черновик
        byte[] draftContent = fileStorageService.loadFile(document.getFilePath());

        // Подписываем
        byte[] signedContent = doceoSigner.sign(draftContent);

        // Сохраняем подписанный файл
        String publishedFilePath = fileStorageService.savePublication(documentId, signedContent);
        String signature = doceoSigner.extractSignature(signedContent);

        // Создаём публикацию
        Publication publication = Publication.fromDocument(document, publishedFilePath, signature);
        publicationRepository.save(publication);

        // Обновляем статус документа
        document.publish();
        documentRepository.save(document);
    }

    @Transactional
    public void unpublish(UUID documentId, UUID userId) {
        Document document = documentRepository.findByIdAndAuthorId(documentId, userId)
                .orElseThrow(() -> new RuntimeException("Document not found or access denied"));

        publicationRepository.deleteByDocumentId(documentId);
        document.unpublish();
        documentRepository.save(document);
    }

    public byte[] getPublicationFile(UUID documentId) {
        Publication publication = publicationRepository.findByDocumentId(documentId)
                .orElseThrow(() -> new RuntimeException("Document not published"));

        // Дополнительно проверяем, что сам документ не archived
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getStatus() == DocumentStatus.ARCHIVED) {
            throw new RuntimeException("Document is archived");
        }

        return fileStorageService.loadFile(publication.getFilePath());
    }

    public DocumentMetadataResponse getMetadata(UUID documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Пытаемся найти публикацию
        Publication publication = publicationRepository.findByDocumentId(documentId).orElse(null);

        String publishedAt = publication != null ? publication.getPublishedAt().toString() : null;

        // Получаем информацию об авторе
        UserInfo authorInfo = userPort.getUserInfo(document.getAuthorId())
                .orElseThrow(() -> new RuntimeException("Author not found"));

        return new DocumentMetadataResponse(
                document.getId().toString(),
                publication != null ? publication.getTitle() : document.getTitle(),
                publication != null ? publication.getDescription() : document.getDescription(),
                new AuthorInfo(authorInfo.id().toString(), authorInfo.fullName()),
                document.getStatus().name(),
                publishedAt,
                document.getUpdatedAt().toString()
        );
    }

    public VerifyResponse verify(byte[] doceoContent) {
        // Проверяем целостность
        if (!doceoParser.isIntegrityValid(doceoContent)) {
            return new VerifyResponse(false, "tampered", null, null, null);
        }

        // Проверяем подпись (если есть)
        String signature = doceoParser.extractSignature(doceoContent);
        if (signature == null) {
            return new VerifyResponse(false, "unsigned", null, null, null);
        }

        // Верифицируем подпись через сервер
        boolean signatureValid = doceoSigner.verifySignature(doceoContent);
        if (!signatureValid) {
            return new VerifyResponse(false, "tampered", null, null, null);
        }

        // Подпись валидна. Пытаемся найти документ в БД по UUID
        UUID documentId = doceoParser.extractDocumentId(doceoContent);
        if (documentId != null) {
            return documentRepository.findById(documentId)
                    .map(doc -> {
                        UserInfo author = userPort.getUserInfo(doc.getAuthorId()).orElse(null);
                        return new VerifyResponse(
                                true, "verified",
                                doc.getId().toString(),
                                doc.getTitle(),
                                author != null ? author.fullName() : null
                        );
                    })
                    .orElse(new VerifyResponse(true, "verified", null, null, null));
        }

        return new VerifyResponse(true, "verified", null, null, null);
    }
}