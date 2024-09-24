import React, { useState, useEffect } from "react";
import HeaderComponent from "../../../components/header";
import Modal from "./CreateReview/Pop_Up";
import ModalEdit from "./EditReview/EditReview"; // นำเข้าโมดัลที่สอง
import { GetReviewById, GetPaymentByIdUser } from "../../../services/https";
import { Card, message } from "antd";
import { PaymentsReviewInterface } from "../../../interfaces/IPayment";
import "./popup.css";

const Review: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false); // สถานะใหม่สำหรับโมดัลที่สอง
  const [currentCourseId, setCurrentCourseId] = useState<number | null>(null);
  const [currentReviewId, setCurrentReviewId] = useState<number | null>(null); // เก็บ reviewId
  const [hasReviewed, setHasReviewed] = useState<{ [key: number]: boolean }>({});
  const [payments, setPayments] = useState<PaymentsReviewInterface[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [uid, setUid] = useState<number>(Number(localStorage.getItem("id")) || 0);

  useEffect(() => {
    setUid(Number(localStorage.getItem("id")));
    const fetchAllReviewsAndPayments = async () => {
      const reviewStatus: { [key: number]: boolean } = {};
      
      const paymentsData = await GetPaymentByIdUser(uid);

      if (!paymentsData || paymentsData.length === 0) return;

      for (const payment of paymentsData) {
        const reviews = await GetReviewById(payment.CourseID);
        const userReview = reviews.find((review) => review.UserID === uid);
        reviewStatus[payment.CourseID!] = !!userReview;
      }

      setHasReviewed(reviewStatus);
      setPayments(paymentsData);
    };

    fetchAllReviewsAndPayments();
  }, [uid]);

  const openModal = async (id: number) => {
    if (hasReviewed[id]) {
      setCurrentCourseId(id);
      setIsEditOpen(true); // เปิดโมดัลที่สองเมื่อมีการรีวิวแล้ว
      const reviews = await GetReviewById(id); // ดึงข้อมูลรีวิวตาม CourseID
      const userReview = reviews.find((review) => review.UserID === uid);
      if (userReview && userReview.ID !== undefined) {
        console.log("reviewId:", userReview.ID); // แสดง reviewId ในคอนโซล
        setCurrentReviewId(userReview.ID); // เก็บ reviewId ใน state
      } else {
        setCurrentReviewId(null); // กำหนดเป็น null ถ้าไม่มี review
      }
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
      {contextHolder}
      <HeaderComponent />
      <br />
      <br />
      <br />
      <br />
      <div className="header-course">MyCourse</div>
      <div className="setcourse">
        <div className="review-layer">
          {payments.map((payment, index) => (
            <Card key={index} className="product-review">
              <img
                src={payment.Course.ProfilePicture}
                alt={`${payment.Course.Title} Course`}
              />
              <p className="text-product">
                <strong>ชื่อ : {payment.Course.Title}</strong>
                <br />
                Tutor ID : {payment.Course.TutorProfileID}
                <div className="button-open">
                  {hasReviewed[payment.CourseID!] ? (
                    <button
                      className="button-open-model"
                      onClick={() => openModal(payment.CourseID!)} 
                    >
                      Edit Review
                    </button>
                  ) : (
                    <button
                      className="button-open-model"
                      onClick={() => openModal(payment.CourseID!)}
                    >
                      Review Course
                    </button>
                  )}
                  {currentCourseId === payment.CourseID && isOpen && (
                    <Modal
                      open={isOpen}
                      onClose={() => setIsOpen(false)}
                      CourseID={currentCourseId!}
                      UserID={uid}
                      onReviewSubmit={handleReviewSubmit}
                    />
                  )}
                  {currentCourseId === payment.CourseID && isEditOpen && currentReviewId !== null && (
                    <ModalEdit
                      open={isEditOpen}
                      onClose={() => setIsEditOpen(false)} // ปิดโมดัลที่สอง
                      CourseID={currentCourseId!}
                      UserID={uid}
                      onReviewSubmit={handleReviewSubmit}
                      reviewId={currentReviewId} // ส่ง ID ของรีวิวที่มีอยู่
                    />
                  )}
                </div>
              </p>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default Review;