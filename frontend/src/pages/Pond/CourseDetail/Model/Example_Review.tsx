import React, { useEffect, useState } from "react";
import { ReviewInterface } from "../../../../interfaces/IReview";
import { GetReviewById, GetUserByIdReview } from "../../../../services/https";
import { FaStar } from "react-icons/fa";
import { Card } from "antd";
interface ExampleReviewProps {
  course_id: number;
}

const Example_Review: React.FC<ExampleReviewProps> = ({ course_id }) => {
  const [filteredReviews, setFilteredReviews] = useState<ReviewInterface[]>([]);
  const [userNames, setUserNames] = useState<string[]>([]);
  const [userProfiles, setUserProfiles] = useState<string[]>([]);

  const getReviewsById = async (id: number) => {
    let res = await GetReviewById(id);
    if (res) {
      setFilteredReviews(res.slice(0, 2));

      const userPromises = res.map(async (review) => {
        if (review.UserID) {
          const { profile, fullName } = await getUserNameAndProfileById(
            review.UserID
          );
          return { name: fullName, profile };
        }
        return { name: "Unknown User", profile: "" };
      });

      const userInfos = await Promise.all(userPromises);
      setUserNames(userInfos.map((info) => info.name));
      setUserProfiles(userInfos.map((info) => info.profile));
    }
  };

  const getUserNameAndProfileById = async (id: number) => {
    let user = await GetUserByIdReview(id);
    if (user) {
      console.log("User Profile: ", user.Profile); // เพิ่มการตรวจสอบ URL ของโปรไฟล์
      return {
        fullName: `${user.FirstName ?? ""} ${user.LastName ?? ""}`,
        profile: user.Profile || "",
      };
    }
    return { fullName: "", profile: "" };
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return "Unknown Date";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    if (typeof date === "string") {
      return new Date(date).toLocaleDateString(undefined, options);
    }

    return date.toLocaleDateString(undefined, options);
  };

  const renderStarsUser = (rating: number = 0) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? "star-color-rating" : "star-color-fail"}
      />
    ));
  };

  const truncateComment = (comment?: string) => {
    if (!comment) return "";
    return comment.length > 100 ? `${comment.slice(0, 100)}...` : comment;
  };

  const renderComment = (comment?: string) => {
    if (!comment) return null;
    const truncatedComment = truncateComment(comment);
    return <span dangerouslySetInnerHTML={{ __html: truncatedComment }} />;
  };

  useEffect(() => {
    const fetchReviews = async () => {
      await getReviewsById(course_id); // ใช้ course_id จาก props
    };

    fetchReviews();
  }, [course_id]);

  return (
    <div>
      <div className="box-course-profile">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review, index) => (
            <Card>
              <div key={review.ID} className="review-container">
                <img
                  src={userProfiles[index] || ""}
                  className="review-profile-img"
                  alt="User Profile"
                />
                <div className="reviews-comment-text">
                  <p>Name: {userNames[index] ?? "Unknown User"}</p>
                  <p>Rating: {renderStarsUser(review.Rating ?? 0)} <span className="date-review">{formatDate(review.ReviewDate)}</span></p>
                  <p>{renderComment(review.Comment)}</p>
                </div>
                <hr />
              </div>
            </Card>
          ))
        ) : (
          <p>No Reviews Found.</p>
        )}
      </div>
    </div>
  );
};

export default Example_Review;
