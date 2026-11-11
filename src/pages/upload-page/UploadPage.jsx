import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import uploadCloudIcon from "../../assets/icons/upload-cloud.svg";
import circleIcon from "../../assets/icons/circle.svg";
import circleDotIcon from "../../assets/icons/circle-dot.svg";

import professorImage from "../../assets/images/professor-ParkYongHo.svg";
import highschoolImage from "../../assets/images/high3-LeeDoYoon.svg";
import collegeImage from "../../assets/images/college2-ChoiSeoYoon.svg";
import elementaryImage from "../../assets/images/element5-KimHaRin.svg";

import { getPersonas } from "../../api/personaApi";
import { uploadMaterial, getMaterialStatus } from "../../api/materialApi";
import { startLesson } from "../../api/lessonApi";

import "./UploadPage.css";

const studentProfiles = {
  haneul: {
    image: elementaryImage,
    level: "초등학교 5학년",
    description: "쉬운 말이 필요해요. 어려운 용어가 나오면 뜻부터 물어봐요.",
  },
  minjun: {
    image: highschoolImage,
    level: "고등학교 1학년",
    description: '"왜요?"를 파고들고, 이해하면 자기 말로 정리해요.',
  },
  seoyeon: {
    image: collegeImage,
    level: "대학교 2학년",
    description: "반례와 예외로 설명의 빈틈을 확인해요.",
  },
  hyunwoo: {
    image: professorImage,
    level: "대학 교수님",
    description: "부드럽게 묻지만, 정의·근거·조건을 끝까지 확인해요.",
  },
};

const allowedExtensions = [
  "pdf",
  "ppt",
  "pptx",
  "doc",
  "docx",
  "txt",
  "md",
  "png",
  "jpg",
  "jpeg",
  "js",
  "jsx",
  "ts",
  "tsx",
  "py",
  "java",
  "c",
  "cpp",
  "h",
  "hpp",
  "cs",
  "go",
  "rs",
  "html",
  "css",
];

const fileAccept = allowedExtensions
  .map((extension) => `.${extension}`)
  .join(",");

const processingSteps = [
  { key: "read", label: "학습 자료 읽기" },
  { key: "terms", label: "용어 체크리스트 생성" },
  { key: "summary", label: "학습 내용 정리" },
  { key: "original_deleted", label: "자료 처리 마무리" },
];

function getFileTitle(fileName) {
  const lastDot = fileName.lastIndexOf(".");

  if (lastDot <= 0) {
    return fileName;
  }

  return fileName.slice(0, lastDot);
}

function getStudentLabel(student) {
  const profile = studentProfiles[student.code];

  if (profile?.level) {
    return profile.level;
  }

  return student.grade_label || "";
}

function getStudentDescription(student) {
  return (
    studentProfiles[student.code]?.description || student.description || ""
  );
}

function getErrorMessage(error) {
  switch (error.code) {
    case "VALIDATION_ERROR":
      return "수업 제목과 학습 자료를 확인해 주세요.";

    case "UNSUPPORTED_FILE_TYPE":
      return "지원하지 않는 파일 형식이에요. 다른 파일을 선택해 주세요.";

    case "FILE_TOO_LARGE":
      return "파일이 너무 커요. 크기를 줄여 다시 올려 주세요.";

    case "UNREADABLE_MATERIAL":
      return "자료에서 내용을 읽을 수 없어요. 다른 파일을 올려 주세요.";

    case "AI_ERROR":
      return "자료를 정리하지 못했어요. 다시 시도해 주세요.";

    case "MATERIAL_NOT_READY":
      return "자료 정리가 아직 끝나지 않았어요. 다시 확인해 주세요.";

    case "MATERIAL_ALREADY_USED":
      return "이미 수업에 사용한 자료예요. 새 자료를 올려 주세요.";

    case "PROCESSING_TIMEOUT":
      return "자료 정리가 계속 진행 중이에요. 잠시 후 다시 확인해 주세요.";

    case "INVALID_PERSONA_RESPONSE":
      return "학생 목록을 불러오지 못했어요.";

    default:
      return "잠시 문제가 생겼어요. 다시 시도해 주세요.";
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForMaterialReady(materialId, onProgress, isActive) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (!isActive()) return null;

    const material = await getMaterialStatus(materialId);

    if (!isActive()) return null;

    onProgress(material);

    if (material.status === "ready") {
      return material;
    }

    if (material.status === "failed") {
      const error = new Error("자료 정리에 실패했습니다.");

      error.code = material.error?.code || "AI_ERROR";
      error.requestId = material.error?.request_id;

      throw error;
    }

    if (material.status !== "processing") {
      throw new Error("UNKNOWN_MATERIAL_STATUS");
    }

    await sleep(2000);
  }

  const error = new Error("자료 정리가 아직 완료되지 않았습니다.");
  error.code = "PROCESSING_TIMEOUT";

  throw error;
}

function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const mountedRef = useRef(true);
  const submittingRef = useRef(false);

  const [personas, setPersonas] = useState([]);
  const [isLoadingPersonas, setIsLoadingPersonas] = useState(true);
  const [personaError, setPersonaError] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState("");

  const [customTitle, setCustomTitle] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [processingStatus, setProcessingStatus] = useState("");
  const [processingStepsState, setProcessingStepsState] = useState(null);

  const [pendingMaterialId, setPendingMaterialId] = useState(null);

  const defaultTitle = selectedFile ? getFileTitle(selectedFile.name) : "";

  const finalTitle = customTitle.trim() || defaultTitle;

  const isTitleValid = finalTitle.length >= 1 && finalTitle.length <= 100;

  const canStart =
    selectedFile !== null &&
    selectedStudent !== null &&
    isTitleValid &&
    !isGenerating &&
    !isLoadingPersonas;

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    const fetchPersonas = async () => {
      setIsLoadingPersonas(true);
      setPersonaError("");

      try {
        const data = await getPersonas();

        if (cancelled) return;

        setPersonas(data);
      } catch (error) {
        if (cancelled) return;

        console.error("학생 목록 조회 실패:", {
          code: error.code,
          status: error.status,
          requestId: error.requestId,
        });

        if (error.code === "NICKNAME_REQUIRED") {
          navigate("/nickname", { replace: true });
          return;
        }

        if (error.code === "UNAUTHORIZED") {
          navigate("/login", { replace: true });
          return;
        }

        setPersonaError(getErrorMessage(error));
      } finally {
        if (!cancelled) {
          setIsLoadingPersonas(false);
        }
      }
    };

    fetchPersonas();

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, [navigate]);

  const handleFile = (file) => {
    if (!file || isGenerating) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setFileError("지원하지 않는 파일 형식이에요.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setCustomTitle("");
    setFileError("");
    setGenerateError("");
    setPendingMaterialId(null);
    setProcessingStatus("");
    setProcessingStepsState(null);
  };

  const handleFileChange = (event) => {
    handleFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    if (isGenerating) return;

    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleApiError = (error) => {
    console.error("수업 준비 실패:", {
      code: error.code,
      status: error.status,
      requestId: error.requestId,
    });

    if (error.code === "NICKNAME_REQUIRED") {
      navigate("/nickname", { replace: true });
      return;
    }

    if (error.code === "UNAUTHORIZED") {
      navigate("/login", { replace: true });
      return;
    }

    if (error.code === "FORBIDDEN" || error.code === "NOT_FOUND") {
      setGenerateError("자료를 찾을 수 없어요.");
      return;
    }

    setGenerateError(getErrorMessage(error));
  };

  const handleStart = async () => {
    if (!canStart || submittingRef.current) return;

    const student = personas.find((item) => item.id === selectedStudent);

    if (!student) return;

    submittingRef.current = true;
    setIsGenerating(true);
    setGenerateError("");
    setProcessingStatus("uploading");
    setProcessingStepsState(null);

    try {
      let materialId = pendingMaterialId;

      if (materialId == null) {
        const material = await uploadMaterial({
          title: finalTitle,
          file: selectedFile,
        });

        if (!mountedRef.current) return;

        materialId = material.id;
        setPendingMaterialId(materialId);
      }

      setProcessingStatus("processing");

      const readyMaterial = await waitForMaterialReady(
        materialId,
        (material) => {
          if (!mountedRef.current) return;

          setProcessingStepsState(material.steps);
        },
        () => mountedRef.current,
      );

      if (!mountedRef.current || !readyMaterial) return;

      setProcessingStatus("starting");

      const lesson = await startLesson({
        materialId,
        personaId: student.id,
      });

      if (!mountedRef.current) return;

      sessionStorage.setItem("lesson_id", String(lesson.id));

      sessionStorage.setItem(
        "teachingStudent",
        lesson.persona?.name || student.name,
      );

      sessionStorage.setItem("teachingStudentId", student.code);

      sessionStorage.setItem("teachingFileName", selectedFile.name);

      sessionStorage.setItem(
        "teachingTitle",
        lesson.material?.title || finalTitle,
      );

      navigate("/teaching", {
        state: {
          lessonId: lesson.id,
          lesson,
          topic: lesson.material?.title || finalTitle,
          title: lesson.material?.title || finalTitle,
          studentId: student.code,
          personaId: student.id,
          studentName: lesson.persona?.name || student.name,
          studentLevel: getStudentLabel(student),
          fileName: selectedFile.name,
          terms: lesson.terms || [],
          messages: lesson.messages || [],
        },
      });
    } catch (error) {
      if (!mountedRef.current) return;

      handleApiError(error);
    } finally {
      submittingRef.current = false;

      if (mountedRef.current) {
        setIsGenerating(false);
        setProcessingStatus("");
      }
    }
  };

  const getStepText = (status) => {
    switch (status) {
      case "done":
        return "완료";
      case "running":
        return "진행 중";
      default:
        return "대기 중";
    }
  };

  const getLoadingTitle = () => {
    if (processingStatus === "uploading") {
      return "학습 자료를 업로드하고 있어요";
    }

    if (processingStatus === "starting") {
      return "수업을 시작하고 있어요";
    }

    return "수업을 준비하고 있어요";
  };

  return (
    <div className="app-page upload-page">
      <PageHeader
        title="수업 자료 제출"
        description="가르치고 싶은 학습 자료를 올려주세요."
      />

      <div className="upload-page__content">
        <section className="upload-page__panel">
          <div className="upload-page__title-field">
            <label htmlFor="class-title">수업 제목</label>

            <input
              id="class-title"
              type="text"
              value={customTitle}
              onChange={(event) => setCustomTitle(event.target.value)}
              placeholder={defaultTitle || "수업 제목을 입력해 주세요"}
              disabled={isGenerating}
              maxLength={100}
            />

            <p>제목을 입력하지 않으면 파일명이 사용됩니다.</p>
          </div>

          <h2>학습 자료 업로드</h2>

          <input
            ref={fileInputRef}
            type="file"
            className="upload-page__file-input"
            accept={fileAccept}
            onChange={handleFileChange}
            disabled={isGenerating}
            aria-label="학습 자료 파일 선택"
          />

          <div
            className={`upload-page__dropzone ${
              isDragging ? "upload-page__dropzone--dragging" : ""
            } ${isGenerating ? "upload-page__dropzone--disabled" : ""}`}
            role="button"
            tabIndex={isGenerating ? -1 : 0}
            aria-disabled={isGenerating}
            onClick={() => {
              if (!isGenerating) {
                fileInputRef.current?.click();
              }
            }}
            onKeyDown={(event) => {
              if (isGenerating) return;

              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();

              if (!isGenerating) {
                setIsDragging(true);
              }
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <img
              src={uploadCloudIcon}
              alt=""
              className="upload-page__upload-icon"
            />

            {selectedFile ? (
              <>
                <p className="upload-page__file-name">{selectedFile.name}</p>

                <span className="upload-page__file-description">
                  다른 파일을 선택하려면 클릭해 주세요.
                </span>
              </>
            ) : (
              <>
                <p className="upload-page__upload-title">파일을 올려주세요</p>

                <span className="upload-page__file-description">
                  PDF, PPT, DOCX, TXT, MD, 이미지, 소스코드
                </span>
              </>
            )}
          </div>

          {fileError && (
            <p className="upload-page__error" role="alert">
              {fileError}
            </p>
          )}
        </section>

        <section className="upload-page__panel">
          <h2>학생 AI 선택</h2>

          <p className="upload-page__panel-description">
            가르칠 학생을 선택해 주세요.
          </p>

          {isLoadingPersonas ? (
            <p className="upload-page__panel-description">
              학생 목록을 불러오는 중...
            </p>
          ) : personaError ? (
            <p className="upload-page__error" role="alert">
              {personaError}
            </p>
          ) : (
            <div className="upload-page__student-list">
              {personas.map((student) => {
                const isSelected = selectedStudent === student.id;

                const profile = studentProfiles[student.code];

                return (
                  <button
                    key={student.id}
                    type="button"
                    className={`upload-page__student ${
                      isSelected ? "upload-page__student--selected" : ""
                    }`}
                    onClick={() => setSelectedStudent(student.id)}
                    aria-pressed={isSelected}
                    disabled={isGenerating}
                  >
                    {profile?.image && (
                      <img
                        src={profile.image}
                        alt=""
                        className="upload-page__student-image"
                      />
                    )}

                    <div className="upload-page__student-info">
                      <strong>
                        {student.name} · {getStudentLabel(student)}
                      </strong>

                      <span>{getStudentDescription(student)}</span>
                    </div>

                    <img
                      src={isSelected ? circleDotIcon : circleIcon}
                      alt=""
                      className="upload-page__radio-icon"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {generateError && (
        <p
          className="upload-page__error upload-page__generate-error"
          role="alert"
        >
          {generateError}
        </p>
      )}

      <button
        type="button"
        className="upload-page__start-button"
        onClick={handleStart}
        disabled={!canStart}
      >
        {isGenerating ? "수업 준비 중..." : "수업 시작하기"}
      </button>

      {isGenerating && (
        <div
          className="upload-page__loading-overlay"
          role="status"
          aria-live="polite"
        >
          <div className="upload-page__loading-card">
            <div className="upload-page__spinner" aria-hidden="true" />

            <h2>{getLoadingTitle()}</h2>

            <p>학습 자료를 분석하고 수업을 준비하고 있어요.</p>

            {processingStatus === "processing" && (
              <div className="upload-page__progress-list">
                {processingSteps.map((step) => {
                  const status = processingStepsState?.[step.key] || "pending";

                  return (
                    <div key={step.key} className="upload-page__progress-item">
                      <span>{step.label}</span>
                      <strong>{getStepText(status)}</strong>
                    </div>
                  );
                })}
              </div>
            )}

            {processingStatus === "uploading" && (
              <strong>자료 업로드 중...</strong>
            )}

            {processingStatus === "starting" && (
              <strong>AI 학생을 불러오는 중...</strong>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadPage;
