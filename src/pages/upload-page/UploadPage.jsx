import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import uploadCloudIcon from "../../assets/icons/upload-cloud.svg";
import circleIcon from "../../assets/icons/circle.svg";
import circleDotIcon from "../../assets/icons/circle-dot.svg";

import professorImage from "../../assets/images/professor-ParkYongHo.svg";
import highschoolImage from "../../assets/images/high3-LeeDoYoon.svg";
import collegeImage from "../../assets/images/college2-ChoiSeoYoon.svg";
import elementaryImage from "../../assets/images/element5-KimHaRin.svg";

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

function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState("");

  const canStart = selectedFile !== null && selectedStudent !== null;

  const handleFile = (file) => {
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setFileError("지원하지 않는 파일 형식입니다.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setFileError("");
  };

  const handleFileChange = (event) => {
    handleFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleStart = () => {
    if (!canStart) return;

    const student = students.find((item) => item.id === selectedStudent);

    sessionStorage.setItem("teachingStudent", student.name);
    sessionStorage.setItem("teachingStudentId", student.id);
    sessionStorage.setItem("teachingFileName", selectedFile.name);

    navigate("/teaching", {
      state: {
        studentId: student.id,
        studentName: student.name,
        studentLevel: student.level,
        fileName: selectedFile.name,
      },
    });
  };

  return (
    <div className="upload-page">
      <header className="upload-page__header">
        <h1>수업 자료 제출</h1>
        <p>가르치고 싶은 학습 자료를 올려주세요.</p>
      </header>

      <div className="upload-page__content">
        <section className="upload-page__panel">
          <h2>학습 자료 업로드</h2>

          <input
            ref={fileInputRef}
            type="file"
            className="upload-page__file-input"
            accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp"
            onChange={handleFileChange}
            aria-label="학습 자료 파일 선택"
          />

          <div
            className={`upload-page__dropzone ${
              isDragging ? "upload-page__dropzone--dragging" : ""
            }`}
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
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

      <button
        type="button"
        className="upload-page__start-button"
        onClick={handleStart}
        disabled={!canStart}
      >
        수업 시작하기
      </button>
    </div>
  );
}

export default UploadPage;
