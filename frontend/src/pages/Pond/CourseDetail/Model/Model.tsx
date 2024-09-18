import React, { useState, useEffect } from "react"; // นำเข้า React และ hook ที่จำเป็น
import { FaStar } from "react-icons/fa"; // นำเข้าไอคอนรูปดาว
import {
  GetReviewById, // ฟังก์ชันเพื่อดึงรีวิวโดย ID
  GetFilteredReviews, // ฟังก์ชันเพื่อดึงรีวิวที่กรองตามระดับดาว
  GetUserById, // ฟังก์ชันเพื่อดึงข้อมูลผู้ใช้โดย ID
  SearchReviewsByKeyword, // ฟังก์ชันเพื่อค้นหารีวิวโดยคำค้น
} from "../services/https"; // นำเข้าฟังก์ชันบริการจากไฟล์ https
import { ReviewInterface } from "../interfaces/IReview"; // นำเข้าคุณสมบัติของรีวิว
import { Modal, Input, Button, Row, Col, Divider, Select } from "antd"; // นำเข้าส่วนประกอบ UI จาก Ant Design
import AverageStar from "../Feture/AverageStar"; // นำเข้าคอมโพเนนต์ AverageStar
import Like from "../Feture/Like"; // นำเข้าคอมโพเนนต์ Like
import "./modal.css"; // นำเข้าไฟล์ CSS สำหรับสไตล์ของ modal
import NoReview from "../assets/no review.jpg";

const { Option } = Select; // ตั้งค่าตัวเลือกของ Select

// กำหนดประเภทของ prop ที่คอมโพเนนต์ ModalTest จะรับ
interface ReviewModalProps {
  id: number; // ID ของคอร์สที่รีวิว
  isVisible: boolean; // สถานะการแสดงผลของ modal
  handleCancel: () => void; // ฟังก์ชันสำหรับปิด modal
}

// คอมโพเนนต์ ModalTest ที่รับ prop ตามที่กำหนด
const ModalTest: React.FC<ReviewModalProps> = ({
  isVisible, // สถานะการแสดงผลของ modal
  handleCancel, // ฟังก์ชันเมื่อปิด modal
  id, // ID ของคอร์สที่รีวิว
}) => {
  // ใช้ useState เพื่อสร้างสถานะต่างๆ
  const [reviews, setReviews] = useState<ReviewInterface[]>([]); // สถานะเก็บรีวิวทั้งหมด
  const [filteredReviews, setFilteredReviews] = useState<ReviewInterface[]>([]); // สถานะเก็บรีวิวที่กรอง
  const [starLevel, setStarLevel] = useState<string>("All"); // สถานะเก็บระดับดาวที่เลือก
  const [searchKeyword, setSearchKeyword] = useState<string>(""); // สถานะเก็บคำค้นหา
  const [userProfiles, setUserProfiles] = useState<Record<number, string>>({}); // สถานะเก็บโปรไฟล์ผู้ใช้
  const [userNames, setUserNames] = useState<Record<number, string>>({}); // สถานะเก็บชื่อผู้ใช้
  const [uid, setUid] = useState<number | null>( // สถานะเก็บ ID ของผู้ใช้
    Number(localStorage.getItem("uid")) // ดึง uid จาก localStorage
  );
  const [averageRating, setAverageRating] = useState<number>(0); // สถานะเก็บคะแนนเฉลี่ย
  const [totalReviews, setTotalReviews] = useState<number>(0); // สถานะเก็บจำนวนรีวิวทั้งหมด
  const [expandedReviewIds, setExpandedReviewIds] = useState<number[]>([]); // สถานะเก็บ ID ของรีวิวที่ขยาย

  // useEffect เพื่อดึงข้อมูลเมื่อคอมโพเนนต์ถูกแสดง
  useEffect(() => {
    localStorage.setItem("uid", String(1)); // ตั้งค่า uid ใน localStorage
    setUid(Number(localStorage.getItem("uid"))); // อัปเดตสถานะ uid

    const fetchData = async () => {
      // ฟังก์ชันดึงข้อมูลรีวิว
      try {
        const reviewsData = await GetReviewById(id); // ดึงข้อมูลรีวิวโดย ID
        setReviews((reviewsData as ReviewInterface[]) || []); // ตั้งค่ารีวิวทั้งหมด
        setFilteredReviews((reviewsData as ReviewInterface[]) || []); // ตั้งค่ารีวิวที่กรอง

        // คำนวณคะแนนเฉลี่ย
        const ratings = reviewsData.map((review) => review.Rating ?? 0); // ดึงคะแนนรีวิว
        const average =
          ratings.length > 0
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length // คำนวณคะแนนเฉลี่ย
            : 0; // หากไม่มีรีวิวให้ค่าเป็น 0
        setAverageRating(parseFloat(average.toFixed(1))); // ตั้งค่าคะแนนเฉลี่ย
        setTotalReviews(ratings.length); // ตั้งค่าจำนวนรีวิวทั้งหมด

        // ดึง ID ของผู้ใช้ที่ไม่ซ้ำกัน
        const userIds = Array.from(
          new Set(
            reviewsData
              .map((review) => review.UserID) // สร้างอาเรย์ของ ID ผู้ใช้
              .filter((id) => id !== undefined) // กรอง ID ที่ไม่ซ้ำ
          )
        ) as number[];

        // ดึงข้อมูลผู้ใช้ทีละคน
        const users = await Promise.all(
          userIds.map((userId) => GetUserById(userId)) // ดึงข้อมูลผู้ใช้แต่ละคน
        );
        const profileMap: Record<number, string> = {}; // สร้างอ็อบเจ็กต์เก็บโปรไฟล์
        const nameMap: Record<number, string> = {}; // สร้างอ็อบเจ็กต์เก็บชื่อผู้ใช้

        users.forEach((user) => {
          if (user) {
            // ตรวจสอบว่าผู้ใช้มีข้อมูลหรือไม่
            profileMap[user.ID ?? 0] = user.Profile || ""; // ตั้งค่าโปรไฟล์ของผู้ใช้
            nameMap[user.ID ?? 0] = `${user.FirstName ?? ""} ${
              // ตั้งค่าชื่อเต็มของผู้ใช้
              user.LastName ?? ""
            }`;
          }
        });

        setUserProfiles(profileMap); // ตั้งค่าข้อมูลโปรไฟล์ผู้ใช้
        setUserNames(nameMap); // ตั้งค่าชื่อผู้ใช้
      } catch (error) {
        console.error("Error fetching data:", error); // แสดงข้อความผิดพลาดหากดึงข้อมูลไม่สำเร็จ
      }
    };
    fetchData(); // เรียกฟังก์ชันดึงข้อมูล

    // ฟังก์ชันตรวจจับการเปลี่ยนแปลงใน localStorage
    const handleStorageChange = () => {
      const newUid = Number(localStorage.getItem("uid")); // ดึงค่า uid ใหม่จาก localStorage
      if (newUid !== uid) {
        setUid(newUid); // อัปเดต uid ทันทีเมื่อเปลี่ยนแปลง
      }
    };

    // ตั้งค่าการฟัง event "storage" เพื่อตรวจจับการเปลี่ยนแปลงใน localStorage
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange); // ลบการฟัง event เมื่อคอมโพเนนต์ถูก unmount
    };
  }, [id, uid]); // ตรวจสอบการเปลี่ยนแปลงของ id และ uid

  // useEffect เพื่อรีเซ็ต ID ของรีวิวที่ขยายเมื่อเปิด modal
  useEffect(() => {
    setExpandedReviewIds([]); // รีเซ็ต ID ของรีวิวที่ถูกขยายเมื่อเปิด modal
  }, [isVisible]); // ตรวจสอบการเปลี่ยนแปลงของ isVisible

  const searchAndFilterReviews = async () => {
    // ฟังก์ชันค้นหาและกรองรีวิว
    try {
      let filtered: ReviewInterface[] = reviews; // เริ่มต้นด้วยรีวิวทั้งหมด

      if (searchKeyword.length > 0) {
        // หากมีคำค้นหา
        const result = await SearchReviewsByKeyword(searchKeyword, id); // ดึงรีวิวที่ตรงกับคำค้นหา

        if (result && result.length > 0) {
          // หากพบผลลัพธ์
          const partialMatchRegex = new RegExp(searchKeyword, "gi"); // สร้าง regex สำหรับการจับคู่คำ

          filtered = result.map((review: ReviewInterface) => {
            const comment = review.Comment || ""; // ดึงคอมเมนต์
            // แทนที่คำค้นหาด้วย HTML span สำหรับเน้น
            return {
              ...review,
              Comment: comment.replace(
                partialMatchRegex,
                (match) => `<span class="highlighted-text">${match}</span>`
              ),
            };
          });
        } else {
          filtered = []; // หากไม่มีผลลัพธ์ตั้งค่าเป็นอาเรย์ว่าง
        }
      }

      if (starLevel !== "All") {
        // หากเลือกกรองตามระดับดาว
        const filteredByStars = await GetFilteredReviews(starLevel, id); // ดึงรีวิวที่กรองตามระดับดาว
        if (filteredByStars && filteredByStars.length > 0) {
          // หากพบผลลัพธ์
          filtered = filtered.filter((review: ReviewInterface) =>
            filteredByStars.some(
              (starReview: ReviewInterface) => starReview.ID === review.ID // กรองรีวิวที่ตรงกับผลลัพธ์
            )
          );
        } else {
          filtered = []; // หากไม่มีผลลัพธ์ตั้งค่าเป็นอาเรย์ว่าง
        }
      }

      setFilteredReviews(filtered); // ตั้งค่ารีวิวที่กรอง
    } catch (error) {
      console.error("Error searching and filtering reviews:", error); // แสดงข้อความผิดพลาดหากเกิดข้อผิดพลาด
    }
  };

  const formatDate = (date?: Date | string) => {
    // ฟังก์ชันจัดรูปแบบวันที่
    if (!date) return "Unknown Date"; // หากไม่มีวันที่คืนค่าเป็น "Unknown Date"
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric", // แสดงปี
      month: "long", // แสดงเดือนแบบเต็ม
      day: "numeric", // แสดงวัน
    };
    return typeof date === "string"
      ? new Date(date).toLocaleDateString(undefined, options) // หากเป็น string แปลงเป็นวันที่
      : date.toLocaleDateString(undefined, options); // หากเป็น Date ใช้รูปแบบวันที่
  };

  const renderStars = (
    rating: number = 0 // ฟังก์ชันสำหรับเรนเดอร์ดาวตามคะแนน
  ) =>
    [...Array(5)].map(
      (
        _,
        index // สร้างอาเรย์ของดาว 5 ดวง
      ) => (
        <FaStar
          key={index} // ตั้งค่าคีย์สำหรับแต่ละดาว
          className={index < rating ? "star-color-rating" : "star-color-fail"} // ตั้งค่า class ตามคะแนน
        />
      )
    );

  const toggleShowMore = (reviewId: number) => {
    // ฟังก์ชันสำหรับแสดงหรือซ่อนรีวิวที่ขยาย
    setExpandedReviewIds(
      (prev) =>
        prev.includes(reviewId) // หากรีวิวนี้ถูกขยายอยู่
          ? prev.filter((id) => id !== reviewId) // กรอง ID ออกจากรายการ
          : [...prev, reviewId] // เพิ่ม ID ลงในรายการ
    );
  };

  const renderComment = (review: ReviewInterface) => {
    // ฟังก์ชันสำหรับเรนเดอร์คอมเมนต์
    if (!review.Comment) return null; // หากไม่มีคอมเมนต์คืนค่า null
    const isExpanded = expandedReviewIds.includes(review.ID ?? 0); // ตรวจสอบว่าถูกขยายหรือไม่
    const comment = review.Comment; // ดึงคอมเมนต์

    if (comment.length > 300 && !isExpanded) {
      // หากคอมเมนต์ยาวกว่า 300 ตัวอักษรและยังไม่ถูกขยาย
      return (
        <p>
          <span
            dangerouslySetInnerHTML={{
              __html: comment.substring(0, 300) + "...", // แสดงคอมเมนต์ 300 ตัวแรกและเพิ่ม "..."
            }}
          />
          <span
            onClick={() => toggleShowMore(review.ID ?? 0)} // เมื่อคลิกให้เรียกฟังก์ชัน toggleShowMore
            style={{ color: "#3D3D3D", cursor: "pointer" }} // ตั้งค่าสไตล์สำหรับคลิก
          >
            {" "}
            Show more
          </span>
        </p>
      );
    }

    return (
      <p>
        <span dangerouslySetInnerHTML={{ __html: comment }} />{" "}
        {/* แสดงคอมเมนต์ */}
        {comment.length > 300 &&
          isExpanded && ( // หากคอมเมนต์ยาวกว่า 300 และถูกขยาย
            <span
              onClick={() => toggleShowMore(review.ID ?? 0)} // เมื่อคลิกให้เรียกฟังก์ชัน toggleShowMore
              style={{ color: "#3D3D3D", cursor: "pointer" }} // ตั้งค่าสไตล์สำหรับคลิก
            >
              {" "}
              Show less
            </span>
          )}
      </p>
    );
  };

  return (
    <Modal // คอมโพเนนต์ Modal จาก Ant Design
      title={
        // กำหนดหัวเรื่องของ modal
        <div style={{ display: "flex", alignItems: "center" }}>
          {" "}
          {/* ตั้งค่าให้เป็น Flexbox */}
          <FaStar style={{ color: "#ffc107", fontSize: "24px" }} />{" "}
          {/* แสดงไอคอนรูปดาว */}
          <span
            style={{
              marginLeft: "10px",
              fontSize: "18px",
              fontWeight: "bold",
              color: "rgb(99, 94, 94)",
            }}
          >
            {totalReviews > 0
              ? `${totalReviews.toLocaleString()} Course Rating: ${averageRating} Ratings` // แสดงข้อมูลคะแนน
              : "0 Course Rating: 0 Ratings"}
          </span>
        </div>
      }
      visible={isVisible} // สถานะการแสดงผลของ modal
      onCancel={handleCancel} // ฟังก์ชันเมื่อปิด modal
      footer={null} // ไม่แสดง footer
      className="modal-comment" // ตั้งค่า class สำหรับ modal
      centered // ทำให้ modal อยู่กลางหน้าจอ
    >
      {/* Search bar and filters */}
      <Row gutter={16}>
        {" "}
        {/* ใช้ Row จาก Ant Design */}
        <Col span={24}>
          {" "}
          {/* ใช้ Col จาก Ant Design */}
          <div className="search-container">
            {" "}
            {/* คอนเทนเนอร์สำหรับการค้นหา */}
            <Input
              id="searchKeyword" // ตั้งค่า ID สำหรับ Input
              type="text" // ประเภทของ Input
              value={searchKeyword} // ค่าของ Input มาจาก state
              onChange={(e) => setSearchKeyword(e.target.value)} // ฟังก์ชันเมื่อค่าของ Input เปลี่ยน
              placeholder="Search Keyword" // ข้อความเมื่อไม่มีค่า
              className="search-input" // ตั้งค่า class สำหรับ Input
              style={{ width: "600px" }} // ตั้งค่าความกว้างของ Input
            />
            <Button
              onClick={searchAndFilterReviews} // ฟังก์ชันเมื่อคลิกปุ่มค้นหา
              type="primary" // ตั้งค่า type ของปุ่ม
              style={{
                marginLeft: "10px", // ตั้งค่าระยะห่างด้านซ้าย
                marginTop: "10px", // ตั้งค่าระยะห่างด้านบน
                marginRight: "20px", // ตั้งค่าระยะห่างด้านขวา
              }}
            >
              Search
            </Button>
            <Select
              className="Selector" // ตั้งค่า class สำหรับ Select
              id="starLevel" // ตั้งค่า ID สำหรับ Select
              value={starLevel} // ค่าของ Select มาจาก state
              onChange={(value) => setStarLevel(value)} // ฟังก์ชันเมื่อค่าของ Select เปลี่ยน
              style={{ marginTop: "10px", width: "120px" }} // ตั้งค่าระยะห่างด้านบนและความกว้าง
            >
              <Option value="All">All</Option>
              {[5, 4, 3, 2, 1].map(
                (
                  star // สร้างตัวเลือกสำหรับระดับดาว
                ) => (
                  <Option key={star} value={`${star}Star`}>
                    {star}
                  </Option>
                )
              )}
            </Select>
          </div>
        </Col>
      </Row>

      {/* AverageStar component */}
      <Row gutter={16}>
        <Col span={24}>
          <div className="header-Modal">
            {" "}
            {/* คอนเทนเนอร์สำหรับ AverageStar */}
            <AverageStar courseID={id} />{" "}
            {/* เรียกใช้ AverageStar และส่ง ID คอร์ส */}
          </div>
        </Col>
      </Row>

      {/* Reviews list */}
      <Row gutter={16} align="top">
        {" "}
        {/* ใช้ Row จาก Ant Design */}
        <Col span={24}>
          {" "}
          {/* ใช้ Col จาก Ant Design */}
          <div className="review-list-container">
            {" "}
            {/* คอนเทนเนอร์สำหรับรีวิว */}
            {filteredReviews.length > 0 ? ( // หากมีรีวิวที่กรอง
              filteredReviews.map(
                (
                  review // แสดงรีวิวที่กรองทั้งหมด
                ) => (
                  <div key={review.ID}>
                    {" "}
                    {/* ตั้งค่าคีย์สำหรับแต่ละรีวิว */}
                    <div className="review-container">
                      {" "}
                      {/* คอนเทนเนอร์สำหรับรีวิว */}
                      <img
                        src={userProfiles[review.UserID ?? 0]} // แสดงภาพโปรไฟล์จากโปรไฟล์ผู้ใช้
                        className="review-profile-img" // ตั้งค่า class สำหรับภาพโปรไฟล์
                        alt="User Profile" // ข้อความ alt สำหรับภาพโปรไฟล์
                      />
                      <div className="reviews-comment-text">
                        {" "}
                        {/* คอนเทนเนอร์สำหรับข้อความรีวิว */}
                        <p style={{ fontWeight: "bold" }}>
                          {" "}
                          {/* ตั้งค่าให้ตัวหนา */}
                          {userNames[review.UserID ?? 0]}
                        </p>
                        <p>
                          Rating: {renderStars(review.Rating ?? 0)}
                          <span className="date-review">
                            {" "}
                            {/* แสดงวันที่รีวิว */}
                            {formatDate(review.ReviewDate)}
                          </span>
                        </p>
                        <p>{renderComment(review)}</p> {/* แสดงคอมเมนต์ */}
                        {review.Picture && ( // หากมีภาพในรีวิว
                          <img
                            src={review.Picture} // แสดงภาพ
                            alt="Preview" // ข้อความ alt สำหรับภาพ
                            style={{
                              width: "100px", // กำหนดความกว้างของภาพ
                              height: "60px", // กำหนดความสูงของภาพ
                              objectFit: "cover", // ตั้งค่าให้ภาพถูกตัดให้พอดีกับขนาด
                              borderRadius: "0px", // ตั้งค่าให้ไม่มีมุมโค้ง
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <Like reviewID={review.ID ?? 0} userID={uid ?? 0} />{" "}
                    {/* เรียกใช้คอมโพเนนต์ Like และส่ง ID รีวิวและ ID ผู้ใช้ */}
                    <Divider /> {/* เพิ่มเส้นแบ่ง */}
                  </div>
                )
              )
            ) : (
              // หากไม่มีรีวิวที่กรอง
              <center>
                <div
                  style={{
                    color: "rgb(99, 94, 94)", 
                    fontSize: "28px", 
                    fontFamily: "revert-layer", 
                    display: "flex",
                    flexDirection: "column", 
                    alignItems: "center",
                  }}
                >
                  <p>No Reviews for Course</p> 
                  <img src={NoReview} alt="No reviews" style={{width:"180px"}} />
                  {/* รูปภาพอยู่ด้านล่าง */}
                </div>
              </center>
            )}
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default ModalTest; // ส่งออกคอมโพเนนต์ ModalTest
