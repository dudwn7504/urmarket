<?php
// 워드프레스 코어 파일 로드
require_once( 'wp-load.php' );


$json_data = file_get_contents('city_hotels.json');
$hotels = json_decode($json_data, true);

$city_name = $argv[1];

// 제목 템플릿 배열
$title_templates = array(
    "{$city_name} 아름다운 호텔 TOP 5",
    "{$city_name}의 가성비 호텔 TOP 5",
    "{$city_name}의 럭셔리 호텔 TOP 5",
    "내가 뽑은 {$city_name}의 인생호텔 5개",
    // 추가 가능
);



$random_index = array_rand($title_templates);
$chosen_template = $title_templates[$random_index];




// 포스트 내용 생성
$post_content = "";
foreach ($hotels as $hotel) {
    $post_content .= "<h2>{$hotel['name']}</h2>";
    $post_content .= "<img src='{$hotel['image']}' alt='{$hotel['name']}' />";
    $post_content .= "<p>상세정보: {$hotel['details']}</p>";
    $post_content .= "<p>부대시설: {$hotel['facilities']}</p>";
    $post_content .= "<p>평점: {$hotel['rating']}</p>";
    $post_content .= "<a href='{$hotel['link']}".'?cid=1729890'."'>자세히 보기</a>";
    // $post_content .= "<a href='{$hotel['cid']}' style='margin-left:5px;'>예약은 여기서!</a>";
}

// WordPress 포스트 데이터 배열
$post_data = array(
    'post_title'    => $chosen_template,
    'post_content'  => $post_content,
    'post_status'   => 'publish',
    'post_author'   => 1,
    'post_category' => array(1),
    'post_name'     => sanitize_title($chosen_template) // SEO-friendly URL 생성
);

// 포스트 추가
$post_id = wp_insert_post($post_data);
?>