import React, { useState, useEffect } from "react";
import HeaderComponent from "../../../components/header";
import Golang_photo from "../../../assets/golang.png";
import React_photo from "../../../assets/react.jpg";
import { Link } from "react-router-dom";
import Modal from "./CreateReview/Pop_Up";
import { GetReviewById } from "../../../services/https";
import { message } from "antd"; // นำเข้า message
import "./popup.css";

const Review: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentCourseId, setCurrentCourseId] = useState<number | null>(null);
  const [hasReviewed, setHasReviewed] = useState<{ [key: number]: boolean }>(
    {}
  );
  const userId = 5; // userId ต้องมาจากข้อมูลผู้ใช้ที่ล็อกอินอยู่
  const [messageApi, contextHolder] = message.useMessage(); // ใช้ message API

  useEffect(() => {
    const fetchAllReviews = async () => {
      const courseIds = [1, 2]; // รหัสคอร์สทั้งหมดที่เราต้องการตรวจสอบ เเก้ไข HardCode
      const reviewStatus: { [key: number]: boolean } = {};

      for (const id of courseIds) {
        const reviews = await GetReviewById(id);
        const userReview = reviews.find((review) => review.UserID === userId);
        reviewStatus[id] = !!userReview;
      }

      setHasReviewed(reviewStatus);
    };

    fetchAllReviews();
  }, []);

  const openModal = (id: number) => {
    if (hasReviewed[id]) {
      messageApi.warning("You have already reviewed this course."); // แสดงข้อความแจ้งเตือน
      return;
    }
    setCurrentCourseId(id);
    setIsOpen(true);
  };

  const handleReviewSubmit = (courseId: number) => {
    setHasReviewed((prevState) => ({
      ...prevState,
      [courseId]: true,
    }));
  };

  return (
    <>
    {contextHolder} {/* แสดง contextHolder ที่นี่ */}
      <HeaderComponent /><br /><br /><br /><br />
      <div className="setcourse">
        <div className="review-layer">
          <div className="product-review">
            <Link to="/review/3">
              <img src={Golang_photo} alt="Go Course" />
            </Link>
            <p className="text-product">
              <strong>Name : Go - The Complete Guide </strong>
              <br />
              Tutor ID : 1101 <br />
              <div className="button-open">
                {hasReviewed[1] ? (
                  <button
                    className="button-open-model"
                    onClick={() =>
                      messageApi.warning(
                        "You have already reviewed this course."
                      )
                    }
                  >
                    Already Reviewed
                  </button>
                ) : (
                  <button
                    className="button-open-model"
                    onClick={() => openModal(1)}
                  >
                    Review Course
                  </button>
                )}
                {currentCourseId === 1 && (
                  <Modal
                    open={isOpen}
                    onClose={() => setIsOpen(false)}
                    CourseID={currentCourseId}
                    UserID={userId}
                    onReviewSubmit={handleReviewSubmit}
                  />
                )}
              </div>
            </p>
          </div>

          <div className="product-review">
            <Link to="/review/2">
              <img src={React_photo} alt="React Course" />
            </Link>
            <p className="text-product">
              <strong>Name : The React Course 2024 </strong>
              <br />
              Tutor ID : 1105 <br />
              <div className="button-open">
                {hasReviewed[2] ? (
                  <button
                    className="button-open-model"
                    onClick={() =>
                      messageApi.warning(
                        "You have already reviewed this course."
                      )
                    }
                  >
                    Already Reviewed
                  </button>
                ) : (
                  <button
                    className="button-open-model"
                    onClick={() => openModal(2)}
                  >
                    Review Course
                  </button>
                )}
                {currentCourseId === 2 && (
                  <Modal
                    open={isOpen}
                    onClose={() => setIsOpen(false)}
                    CourseID={currentCourseId}
                    UserID={userId}
                    onReviewSubmit={handleReviewSubmit}
                  />
                )}
              </div>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Review;
