<?php
// Agoda 크롤링 데이터 받아오기 (Node.js 실행)
// $hotels_json = shell_exec('node ap2.js');
$hotels_json = file_get_contents('hotels.json');
$hotels = json_decode($hotels_json, true);

$city_name = $argv[1];
$cid = '?cid=1729890';

if (!$hotels) {
    die("호텔 데이터를 가져오는 데 실패했습니다.");
}

// 랜덤한 제목 목록
$titles = [
    $city_name." 아름다운 호텔 Top 5",
    $city_name."의 가성비 좋은 호텔 5곳",
    $city_name."에서 꼭 묵어야 할 호텔 추천",
    $city_name." 최고의 호텔 5곳을 소개합니다",
    $city_name."에서 가장 인기 있는 호텔 5곳"
];

// 랜덤 제목 선택
$title = $titles[array_rand($titles)];

// WordPress 자동 포스팅
require_once('wp-load.php');

$content = "<h2>{$title}</h2><ul>";

foreach ($hotels as $hotel) {
    $hotel_name = $hotel['name'];
    $hotel_link = $hotel['link'].$cid;
    $hotel_details = $hotel['details'];
    $hotel_rating = $hotel['rating'];
    $hotel_image = $hotel['image'];

    $facilities = implode(", ", $hotel['facilities']);
    
    $content .= "<li>
        <h3><a href='{$hotel_link}' target='_blank'>{$hotel_name}</a></h3>
        <p>⭐ 평점: {$hotel_rating}</p>
        <p>부대시설: {$facilities}</p>
        <p>{$hotel_details}</p>
        <img src='{$hotel_image}' alt='{$hotel_name}' style='width:100%;max-width:600px;'>
    </li>";
}

$content .= "</ul>";

// URL SEO 최적화: 한글을 영문으로 변환하는 간단한 함수
function convert_korean_to_slug($str) {
    $str = preg_replace('/[^a-zA-Z0-9가-힣]/u', ' ', $str);
    $str = preg_replace('/\s+/', '-', $str);
    return strtolower(trim($str));
}

$slug = convert_korean_to_slug($title);

// WordPress 포스트 생성
$post_data = array(
    'post_title'    => wp_strip_all_tags($title),
    'post_content'  => $content,
    'post_status'   => 'publish',
    'post_author'   => 1,
    'post_name'     => $slug, // SEO 최적화된 URL
    'post_category' => array(1) // 카테고리 ID 설정 (원하는 카테고리 ID로 변경)
);

$post_id = wp_insert_post($post_data);

if ($post_id) {
    echo "포스트 생성 완료: {$post_id}";
} else {
    echo "포스트 생성 실패";
}
?>
