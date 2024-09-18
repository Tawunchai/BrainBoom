import { useState, useEffect } from "react"; // นำเข้า useState และ useEffect จาก React
import { FaStar } from "react-icons/fa"; // นำเข้าไอคอนรูปดาวจาก react-icons
import Golang from "../assets/golang.png"; // นำเข้าภาพของ Golang
import { ShoppingCart } from "phosphor-react"; // นำเข้าไอคอนตะกร้าสินค้าจาก phosphor-react
import ModalTest from "./Model"; // นำเข้า component ของ Modal ที่ใช้แสดงผลรีวิวทั้งหมด
import { ReviewInterface } from "../../../../interfaces/IReview"; // นำเข้าการ interface ของ Review
import { GetReviewById, GetUserByIdReview } from "../../../../services/https"; // นำเข้าฟังก์ชัน HTTP service สำหรับดึงข้อมูลรีวิวและผู้ใช้
import { Button } from "antd"; // นำเข้าปุ่มจาก Ant Design
import "./reviews.css"; // นำเข้าไฟล์ CSS สำหรับจัดการสไตล์
import Example_Review from "./Example_Review";

// ฟังก์ชันหลักสำหรับคอร์ส Golang
function Course_Golang() {
  // สร้าง state สำหรับควบคุมการแสดงผลของ modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // สร้าง state สำหรับเก็บรีวิวที่กรองแล้ว เริ่มต้นเป็นอาร์เรย์ว่าง
  const [filteredReviews, setFilteredReviews] = useState<ReviewInterface[]>([]);
  
  // สร้าง state สำหรับเก็บ course ID ตั้งค่าเป็น 1
  const [courseID] = useState<number>(1);
  
  // สร้าง state สำหรับเก็บชื่อผู้ใช้
  const [userNames, setUserNames] = useState<string[]>([]);
  
  // สร้าง state สำหรับเก็บรูปโปรไฟล์ของผู้ใช้
  const [userProfiles, setUserProfiles] = useState<string[]>([]);

  // ฟังก์ชันสำหรับดึงรีวิวตาม course ID
  const getReviewsById = async (id: number) => {
    let res = await GetReviewById(id); // ดึงข้อมูลรีวิวจาก API
    if (res) {
      setFilteredReviews(res.slice(0, 2)); // จำกัดให้แสดงผลแค่ 2 รีวิวแรก

      // ดึงชื่อและโปรไฟล์ของผู้ใช้ที่รีวิว
      const userPromises = res.map(async (review) => {
        if (review.UserID) { // ถ้ารีวิวมี UserID
          const { profile, fullName } = await getUserNameAndProfileById(review.UserID); // ดึงข้อมูลชื่อและโปรไฟล์ผู้ใช้
          return { name: fullName, profile }; // คืนค่าชื่อและโปรไฟล์
        }
        return { name: "Unknown User", profile: "" }; // ถ้าไม่มี UserID ให้แสดงเป็นผู้ใช้ไม่ระบุชื่อ
      });

      // รอให้ดึงข้อมูลผู้ใช้ทั้งหมดเสร็จสิ้น
      const userInfos = await Promise.all(userPromises);

      // เก็บชื่อและโปรไฟล์ลงใน state
      setUserNames(userInfos.map(info => info.name));
      setUserProfiles(userInfos.map(info => info.profile));
    }
  };

  // ฟังก์ชันสำหรับดึงชื่อและรูปโปรไฟล์ของผู้ใช้ตาม ID
  const getUserNameAndProfileById = async (id: number) => {
    let user = await GetUserByIdReview(id); // ดึงข้อมูลผู้ใช้จาก API
    if (user) {
      // ถ้าดึงข้อมูลสำเร็จให้คืนค่าชื่อเต็มและโปรไฟล์
      return {
        fullName: `${user.FirstName ?? ""} ${user.LastName ?? ""}`, // รวมชื่อและนามสกุล
        profile: user.Profile || "" // ถ้าไม่มีรูปโปรไฟล์ให้คืนค่าว่าง
      };
    }
    return { fullName: "", profile: "" }; // ถ้าดึงข้อมูลไม่สำเร็จคืนค่าเป็นค่าว่าง
  };

  // ฟังก์ชันสำหรับแสดง Modal
  const showModal = () => {
    setIsModalVisible(true); // เปิด Modal
  };

  // ฟังก์ชันสำหรับปิด Modal
  const handleCancel = () => {
    setIsModalVisible(false); // ปิด Modal
  };

  // ฟังก์ชันสำหรับแปลงวันที่ให้อยู่ในรูปแบบที่อ่านง่าย
  const formatDate = (date?: Date | string) => {
    if (!date) return "Unknown Date"; // ถ้าไม่มีวันที่ให้คืนค่าว่าไม่ทราบวันที่
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    if (typeof date === "string") {
      return new Date(date).toLocaleDateString(undefined, options); // แปลง string เป็น date
    }

    return date.toLocaleDateString(undefined, options); // แสดงผลวันที่
  };

  // ฟังก์ชันสำหรับแสดงดาว (rating) ของผู้ใช้
  const renderStarsUser = (rating: number = 0) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? "star-color-rating" : "star-color-fail"} // ระบายสีดาวตามคะแนน
      />
    ));
  };

  // ฟังก์ชันสำหรับตัดข้อความ comment ให้สั้นลง
  const truncateComment = (comment?: string) => {
    if (!comment) return "";
    return comment.length > 100 ? `${comment.slice(0, 100)}...` : comment; // ถ้ายาวเกิน 100 ตัวอักษรให้ตัดแล้วเพิ่ม "..."
  };

  // ฟังก์ชันสำหรับแสดง comment แบบสั้น
  const renderComment = (comment?: string) => {
    if (!comment) return null; // ถ้าไม่มี comment ให้คืนค่า null
    const truncatedComment = truncateComment(comment); // เรียกใช้ truncateComment เพื่อตัดข้อความ
    return <span dangerouslySetInnerHTML={{ __html: truncatedComment }} />; // ใช้ dangerouslySetInnerHTML เพื่อแสดง HTML ในข้อความ
  };

  // ใช้ useEffect เพื่อดึงข้อมูลรีวิวเมื่อ component ถูก mount
  useEffect(() => {
    const fetchReviews = async () => {
      await getReviewsById(courseID); // เรียกฟังก์ชันดึงรีวิว
    };

    fetchReviews(); // เรียกใช้เมื่อ component mount
  }, [courseID]); // ทำงานทุกครั้งที่ courseID เปลี่ยน

  // ส่วนการแสดงผลของ component
  return (
    <div className="page">
      <div className="box-course">
        <div className="image-and-text">
          <img src={Golang} alt="Golang" /> {/* แสดงภาพของ Golang */}
          <div className="text-below-image">
            <div className="username-box">
              <p className="create">
                Created by : TanaraT WiTanTiwong <br />
              </p>
              <p className="update">Update : 25/03/2021</p> {/* วันที่อัปเดต */}
            </div>
            <div className="review-example">
              <div className="column-review-example">
                <Example_Review course_id = {courseID}></Example_Review>
                

                <div className="review-all">
                  <Button type="link" onClick={showModal}>
                    Review All {/* ปุ่มสำหรับเปิด Modal แสดงรีวิวทั้งหมด */}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-box">
          <strong>Go - The Complete Guide</strong>
          <br />
          <br />
          $ 12.99 Dollar <br /> {/* ราคา */}
          <br />
          <button className="buy-now">Buy Now</button> {/* ปุ่มซื้อ */}
          <button className="add-to-cart">
            <ShoppingCart size={15} /> Add to Cart {/* ปุ่มเพิ่มในตะกร้า */}
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
      {/* เรียกใช้ Modal สำหรับแสดงผลรีวิวทั้งหมด */}
      <ModalTest isVisible={isModalVisible} handleCancel={handleCancel} id={courseID} />
    </div>
  );
}

export default Course_Golang; // ส่งออกฟังก์ชัน Course_Golang
