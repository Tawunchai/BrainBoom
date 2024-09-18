import { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import Golang from "../assets/react.jpg";
import { ShoppingCart } from "phosphor-react";
import ModalTest from "./Model";
import { ReviewInterface } from "../interfaces/IReview";
import { GetReviewById, GetUserById } from "../services/https";
import { Button } from "antd";
import "./reviews.css";

function Course_React() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filteredReviews, setFilteredReviews] = useState<ReviewInterface[]>([]);
  const [courseID] = useState<number>(2);
  const [userNames, setUserNames] = useState<string[]>([]);
  const [userProfiles, setUserProfiles] = useState<string[]>([]); // Changed to store multiple profiles

  // Function to get reviews by course ID
  const getReviewsById = async (id: number) => {
    let res = await GetReviewById(id);
    if (res) {
      setFilteredReviews(res.slice(0, 2)); // Limit the number of reviews to 2

      // Fetch user names and profiles
      const userPromises = res.map(async (review) => {
        if (review.UserID) {
          const { profile, fullName } = await getUserNameAndProfileById(review.UserID);
          return { name: fullName, profile }; // Return both name and profile
        }
        return { name: "Unknown User", profile: "" };
      });

      // Wait for all user information
      const userInfos = await Promise.all(userPromises);

      // Set names and profiles
      setUserNames(userInfos.map(info => info.name));
      setUserProfiles(userInfos.map(info => info.profile));
    }
  };

  // Function to get user name and profile picture by ID
  const getUserNameAndProfileById = async (id: number) => {
    let user = await GetUserById(id);
    if (user) {
      return {
        fullName: `${user.FirstName ?? ""} ${user.LastName ?? ""}`,
        profile: user.Profile || ""
      };
    }
    return { fullName: "", profile: "" };
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
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
      await getReviewsById(courseID);
    };

    fetchReviews();
  }, [courseID]);

  return (
    <div className="page">
      <div className="box-course">
        <div className="image-and-text">
          <img src={Golang} alt="Golang" />
          <div className="text-below-image">
            <div className="username-box">
              <p className="create">
                Created by : TanaraT WiTanTiwong <br />
              </p>
              <p className="update">Update : 25/03/2021</p>
            </div>
            <div className="review-example">
              <div className="column-review-example">
                <div className="box-course-profile">
                  {filteredReviews.length > 0 ? (
                    filteredReviews.map((review, index) => (
                      <div key={review.ID} className="review-container">
                        <img
                          src={userProfiles[index] || ""} // Use userProfiles array
                          className="review-profile-img"
                          alt="User Profile"
                        />
                        <div className="reviews-comment-text">
                          <p>Name: {userNames[index] ?? "Unknown User"}</p>
                          <p>
                            Rating: {renderStarsUser(review.Rating ?? 0)}{" "}
                          </p>
                          <p>Comment: {renderComment(review.Comment)}</p>
                          <p>
                            Review Date: {formatDate(review.ReviewDate)}
                          </p>
                        </div>
                        <hr />
                      </div>
                    ))
                  ) : (
                    <p>No Reviews Found.</p>
                  )}
                </div>

                <div className="review-all">
                  <Button type="link" onClick={showModal}>
                    Review All
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-box">
          <strong>React Course</strong>
          <br />
          <br />
          $ 12.99 Dollar <br />
          <br />
          <button className="buy-now">Buy Now</button>
          <button className="add-to-cart">
            <ShoppingCart size={15} /> Add to Cart
          </button>
          <br />
          <br />
          <div className="box-description"></div>
          <br />
          <strong>
            <u>This group consists of</u>
          </strong>
          <br />
          <br />
          <p className="text-in">
            Continue studying: 48 Hours
            <hr />
            Number of chapters: 10 chapters
            <hr />
            Study format: Online
            <hr />
            Requirements: Have students come to class on time
            <hr />
            Things to prepare: Have students bring their notebooks
            <hr />
          </p>
        </div>
      </div>
      <ModalTest isVisible={isModalVisible} handleCancel={handleCancel} id={courseID} />
    </div>
  );
}

export default Course_React;
