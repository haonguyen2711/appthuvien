

export interface Category {
  id: string;
  title: string;
  image: string;
}

export interface Ad {
  id: string;
  title: string;
  image: string;
}

export interface Document {
  id: string;
  title: string;
  author: string;
  image: string;
  description: string;
  categoryId: string;
  access: 'Free' | 'VIP';
  content: string;
 
}

export interface UserComment {
  id: string;
  documentId: string; 
  userName: string;
  userAvatar: string; 
  commentText: string;
  timestamp: string; 
  documentTitle?: string; // Optional title for display purposes
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  role: 'Free' | 'VIP' | 'Admin';
  downloadedIds: string[];
  comments?: UserComment[];
  documentTitle: string;
}



// --- DATA ---

export const categories_data: Category[] = [
  { id: '1', title: 'Truyện Tranh', image: 'https://placehold.co/300x300/3498db/ffffff?text=Comic' },
  { id: '2', title: 'Khóa Học', image: 'https://placehold.co/300x300/e74c3c/ffffff?text=Course' },
  { id: '3', title: 'Khoa Học', image: 'https://placehold.co/300x300/2ecc71/ffffff?text=Science' },
  { id: '4', title: 'Lịch Sử', image: 'https://placehold.co/300x300/f1c40f/ffffff?text=History' },
  { id: '5', title: 'Văn Học', image: 'https://placehold.co/300x300/9b59b6/ffffff?text=Literature' },
  { id: '6', title: 'Kinh Tế', image: 'https://placehold.co/300x300/e67e22/ffffff?text=Economy' },
  { id: '7', title: 'Nghệ Thuật', image: 'https://placehold.co/300x300/1abc9c/ffffff?text=Art' },
  { id: '8', title: 'Âm Nhạc', image: 'https://placehold.co/300x300/34495e/ffffff?text=Music' },
  { id: '9', title: 'Đời Sống', image: 'https://placehold.co/300x300/7f8c8d/ffffff?text=Lifestyle' },
  { id: '10', title: 'Thể Thao', image: 'https://placehold.co/300x300/c0392b/ffffff?text=Sports' },
  { id: '11', title: 'Công Nghệ', image: 'https://placehold.co/300x300/8e44ad/ffffff?text=Tech' },
  { id: '12', title: 'Ẩm Thực', image: 'https://placehold.co/300x300/27ae60/ffffff?text=Food' },
];

export const Document_data: Document[] = [
  { 
    id: 'doc1', 
    title: 'Doraemon tập 1', 
    author: 'Fujiko F. Fujio', 
    image: 'https://placehold.co/400x600/3498db/ffffff?text=Doraemon', 
    description: 'Chú mèo máy đến từ tương lai...', 
    categoryId: '1', 
    access: 'Free',
    content: 'Nobita là một cậu bé lớp bốn hậu đậu, lười biếng và yếu đuối. Để giúp đỡ Nobita, Sewashi, cháu chắt của cậu ở thế kỷ 22, đã gửi chú mèo máy Doraemon quay về quá khứ. Doraemon với chiếc túi thần kỳ chứa đầy những bảo bối của tương lai đã mang đến cho Nobita và bạn bè những cuộc phiêu lưu kỳ thú, cũng như giúp Nobita trưởng thành hơn. \n\nTrong tập này, chúng ta sẽ làm quen với những bảo bối đầu tiên như "Cỗ máy thời gian" và "Chong chóng tre". Cùng xem Nobita sẽ gây ra những rắc rối gì nhé!'
  },
  { 
    id: 'doc2', 
    title: 'Conan tập 99', 
    author: 'Gosho Aoyama', 
    image: 'https://placehold.co/400x600/3498db/ffffff?text=Conan', 
    description: 'Cậu bé thám tử bị teo nhỏ...', 
    categoryId: '1', 
    access: 'VIP',
    content: 'Một vụ án mạng bí ẩn lại xảy ra tại khách sạn Haido. Nạn nhân là một CEO công nghệ nổi tiếng. Mọi nghi ngờ đổ dồn về phía cô thư ký xinh đẹp. Tuy nhiên, với óc quan sát tài tình, Conan đã phát hiện ra những điểm bất thường trong lời khai và hiện trường vụ án. \n\nLiệu cậu có thể tìm ra hung thủ thật sự trước khi cảnh sát kết luận sai lầm? Một màn đấu trí căng thẳng giữa Conan và kẻ thủ ác thông minh đang chờ đợi độc giả.'
  },
  { 
    id: 'doc3', 
    title: 'React Native cho người mới', 
    author: 'Lập Trình Viên', 
    image: 'https://placehold.co/400x600/e74c3c/ffffff?text=React+Native', 
    description: 'Học React Native từ cơ bản đến nâng cao.', 
    categoryId: '2', 
    access: 'Free',
    content: 'React Native cho phép bạn xây dựng ứng dụng di động cho cả iOS và Android chỉ với một codebase duy nhất. Khóa học này sẽ hướng dẫn bạn từ những khái niệm cơ bản nhất như Components, Props, State cho đến những chủ đề nâng cao như quản lý trạng thái với Redux, xử lý bất đồng bộ và tích hợp các module native.'
  },
  { 
    id: 'doc4', 
    title: 'Vũ trụ trong vỏ hạt dẻ', 
    author: 'Stephen Hawking', 
    image: 'https://placehold.co/400x600/2ecc71/ffffff?text=Cosmos', 
    description: 'Khám phá những bí ẩn của vũ trụ.', 
    categoryId: '3', 
    access: 'VIP',
    content: 'Từ những lý thuyết phức tạp về lỗ đen, du hành thời gian cho đến nguồn gốc của vũ trụ, Stephen Hawking đã diễn giải chúng một cách vô cùng dễ hiểu và lôi cuốn. Cuốn sách này sẽ mở ra cho bạn một cánh cửa mới để nhìn nhận về thế giới xung quanh và vị trí của chúng ta trong đó.'
  },
];

export const ads_data: Ad[] = [
    { id: 'ad1', title: 'Nâng cấp VIP chỉ từ 19k', image: 'https://placehold.co/800x250/e67e22/ffffff?text=Nâng+cấp+VIP' },
    { id: 'ad2', title: 'Sách mới phát hành tuần này', image: 'https://placehold.co/800x250/1abc9c/ffffff?text=Sách+Mới' },
];

// Dữ liệu giả lập cho các bình luận
export let comments_data: UserComment[] = [
  {
    id: 'comment1',
    documentId: 'doc1', // Bình luận này cho tài liệu có ID 'doc1'
    userName: 'Nguyễn Văn A',
    userAvatar: 'https://placehold.co/100x100/3498db/ffffff?text=A',
    commentText: 'Truyện rất hay, tuổi thơ ùa về!',
    timestamp: '2025-07-30T10:00:00Z',
  },
  {
    id: 'comment2',
    documentId: 'doc2',
    userName: 'Trần Thị B',
    userAvatar: 'https://placehold.co/100x100/e74c3c/ffffff?text=B',
    commentText: 'Sách này cần được đọc bởi tất cả mọi người!',
    timestamp: '2025-07-29T15:30:00Z',
  },
  {
    id: 'comment3',
    documentId: 'doc1', // Bình luận khác cho cùng tài liệu 'doc1'
    userName: 'Phạm Văn C',
    userAvatar: 'https://placehold.co/100x100/2ecc71/ffffff?text=C',
    commentText: 'Nội dung bổ ích, tôi đã học được rất nhiều.',
    timestamp: '2025-07-28T08:45:00Z',
  },
];

export const USER_PROFILE_DATA: UserProfile = {
  id: 'user1',
  name: 'Nguyễn Văn A',
  avatar: 'https://placehold.co/100x100/3498db/ffffff?text=A',
  role: 'Free',
  downloadedIds: ['doc1', 'doc3'],
  documentTitle:'React Native cho người mới',
  comments: [
    {
      id: 'comment1',
      documentId: 'doc1',
      userName: 'Nguyễn Văn A',
      userAvatar: 'https://placehold.co/100x100/3498db/ffffff?text=A',
      documentTitle: 'Doraemon tập 1',
      commentText: 'Truyện rất hay, tuổi thơ ùa về!',
      timestamp: '2025-07-30T10:00:00Z',
    },
    {
      id: 'comment2',
      documentId: 'doc3',
      userName: 'Nguyễn Văn A',
      userAvatar: 'https://placehold.co/100x100/3498db/ffffff?text=A',
      documentTitle: 'React Native cho người mới',
      commentText: 'Khóa học rất chi tiết, dễ hiểu cho người mới bắt đầu.',
      timestamp: '2025-07-29T15:30:00Z',
    },
  ],
};