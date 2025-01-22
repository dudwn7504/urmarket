<?php
// 워드프레스 코어 파일 로드
require_once( 'wp-load.php' );


$sample = '<div class="container">
        <h1>홍콩의 가성비 좋은 고급호텔 TOP5</h1>
        <p class="intro">안녕하세요! 날씨가 좋네요. 홍콩 여행을 계획하고 계신다면, 가성비 좋은 고급호텔 리스트를 확인해보세요!</p>

        <div class="hotelbox">
            <div class="carousel">
                <img class="image2 active" src="https://pix8.agoda.net/hotelImages/37754807/0/237a201547656428406570693326d45c.jpg?ce=0&s=1024x768" alt="호텔 이미지" class="active">
                <img class="image2" src="https://pix8.agoda.net/hotelImages/37754807/0/ac2ac11caea77e48a6add13b435caf18.jpg?ce=0&s=1024x768" alt="호텔 이미지 2">
                <div class="carousel-controls">
                    <button class="prev">&#10094;</button>
                    <button class="next">&#10095;</button>
                </div>
            </div>
            <div class="content">
                <h3>호텔명</h3>
                <p>이 호텔은 훌륭한 시설과 친절한 서비스를 제공합니다. 완벽한 위치와 함께 편안한 휴식을 제공합니다.</p>
                <h5>주위 가볼만한 곳</h5>
                <ul>
                    <li>랜드마크 1</li>
                    <li>랜드마크 2</li>
                    <li>랜드마크 3</li>
                </ul>
                <h5>호텔 시설, 특징, 교통</h5>
                <ul>
                    <li>무료 와이파이</li>
                    <li>수영장</li>
                    <li>대중교통 접근성</li>
                </ul>
            </div>
        </div>

        <!-- Add more hotelboxes as needed -->

        <script>
            document.addEventListener("DOMContentLoaded", function() {
                const carousels = document.querySelectorAll(".carousel");

                carousels.forEach(carousel => {
                    const images = carousel.querySelectorAll(".image2");
                    let currentIndex = 0;

                    const prevButton = carousel.querySelector(".prev");
                    const nextButton = carousel.querySelector(".next");

                    function updateCarousel(index) {
                        images.forEach((img, i) => {
                            img.classList.toggle("active", i === index);
                        });
                    }

                    prevButton.addEventListener("click", () => {
                        currentIndex = (currentIndex - 1 + images.length) % images.length;
                        updateCarousel(currentIndex);
                    });

                    nextButton.addEventListener("click", () => {
                        currentIndex = (currentIndex + 1) % images.length;
                        updateCarousel(currentIndex);
                    });

                    updateCarousel(currentIndex);
                });
            });
        </script>
    </div>';



// 글 정보
$new_post = array(
    'post_title'    => 'test', //제목
    'post_content'  => $sample, //본문
    'post_status'   => 'publish', //발행상태
    'post_author'   => 1, // 작성자 ID
    'post_type'     => 'post' //포스트타입
);

// 글 작성
$post_id = wp_insert_post( $new_post );

// 글이 성공적으로 작성되었는지 확인
if( $post_id ) {
    echo "포스트가 성공적으로 작성되었습니다. 포스트 ID: " . $post_id;
} else {
    echo "포스트 작성에 실패하였습니다.";
}
?>
