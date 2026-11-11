import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import uploadCloudIcon from "../../assets/icons/upload-cloud.svg";
import circleIcon from "../../assets/icons/circle.svg";
import circleDotIcon from "../../assets/icons/circle-dot.svg";

import professorImage from "../../assets/images/professor-ParkYongHo.svg";
import highschoolImage from "../../assets/images/high3-LeeDoYoon.svg";
import collegeImage from "../../assets/images/college2-ChoiSeoYoon.svg";
import elementaryImage from "../../assets/images/element5-KimHaRin.svg";

import {
  getFileTitle,
  createTeachingSession,
  saveTeachingSession,
} from "../../utils/teachingSession";

import "./UploadPage.css";

const students = [
  {
    id: "elementary",
    name: "김하린",
    level: "초등학교 5학년",
    description: "쉬운 예시와 기초 개념을 좋아해요.",
    image: elementaryImage,
  },
  {
    id: "highschool",
    name: "이도윤",
    level: "고등학교 3학년",
    description: "개념을 차근차근 이해하고 싶어 해요.",
    image: highschoolImage,
  },
  {
    id: "college",
    name: "최서윤",
    level: "대학교 2학년",
    description: "개념과 실제 활용 사례를 연결해요.",
    image: collegeImage,
  },
  {
    id: "professor",
    name: "박영호",
    level: "대학 교수님",
    description: "깊이 있는 설명과 근거를 중요하게 생각해요.",
    image: professorImage,
  },
];

const allowedExtensions = [
  "pdf",
  "ppt",
  "pptx",
  "doc",
  "docx",
  "txt",
  "png",
  "jpg",
  "jpeg",
  "webp",
];

async function generateChecklistDemo() {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return [
    {
      id: "term-1",
      name: "핵심 개념",
      concept: "",
    },
    {
      id: "term-2",
      name: "주요 원리",
      concept: "",
    },
    {
      id: "term-3",
      name: "활용 및 예시",
      concept: "",
    },
  ];
}

function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState("");

  const [customTitle, setCustomTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const defaultTitle = selectedFile ? getFileTitle(selectedFile.name) : "";

  const finalTitle = customTitle.trim() || defaultTitle;

  const canStart =
    selectedFile !== null && selectedStudent !== null && !isGenerating;

  const handleFile = (file) => {
    if (!file || isGenerating) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setFileError("지원하지 않는 파일 형식입니다.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setCustomTitle("");
    setFileError("");
    setGenerateError("");
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

  const handleStart = async () => {
    if (!canStart) return;

    const student = students.find((item) => item.id === selectedStudent);

    if (!student) return;

    setIsGenerating(true);
    setGenerateError("");

    try {
      const terms = await generateChecklistDemo();

      const session = createTeachingSession({
        title: finalTitle,
        fileName: selectedFile.name,
        studentId: student.id,
        terms,
      });

      saveTeachingSession(session);

      sessionStorage.setItem("teachingStudent", student.name);

      sessionStorage.setItem("teachingStudentId", student.id);

      sessionStorage.setItem("teachingFileName", selectedFile.name);

      sessionStorage.setItem("teachingTitle", finalTitle);

      navigate("/teaching", {
        state: {
          topic: finalTitle,
          title: finalTitle,
          studentId: student.id,
          studentName: student.name,
          studentLevel: student.level,
          fileName: selectedFile.name,
          terms,
          sessionId: session.id,
        },
      });
    } catch (error) {
      console.error("체크리스트 준비 실패:", error);

      setGenerateError("수업을 준비하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setIsGenerating(false);
    }
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
            accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp"
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
                  PDF, PPT, DOCX, TXT, 이미지
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

          <div className="upload-page__student-list">
            {students.map((student) => {
              const isSelected = selectedStudent === student.id;

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
                  <img
                    src={student.image}
                    alt=""
                    className="upload-page__student-image"
                  />

                  <div className="upload-page__student-info">
                    <strong>
                      {student.name} · {student.level}
                    </strong>

                    <span>{student.description}</span>
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

            <h2>수업을 준비하고 있어요</h2>

            <p>학습 자료의 핵심 용어를 정리하고 있어요.</p>

            <strong>체크리스트 준비 중...</strong>

            <span className="upload-page__loading-demo">
              현재는 데모 체크리스트를 사용합니다.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadPage;
