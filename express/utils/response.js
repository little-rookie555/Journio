// 统一响应处理函数
export const DetailResponse = (trip, user) => {
  return {
    id: trip.id,
    title: trip.title,
    content: trip.content,
    coverImage: trip.coverImage,
    images: trip.images,
    status: trip.status,
    createTime: trip.create_time,
    updateTime: trip.update_time,
    travelDate: trip.travelData,
    duration: trip.duration,
    cost: trip.cost,
    locations: trip.locations || [],
    isLiked: trip.isLiked || false, // 新增字段，默认为false
    author: {
      id: user.id,
      nickname: user.nick_name,
      avatar: user.icon,
    },
    ...(trip.video_url && { video: trip.video_url }),
    ...(trip.likeCount && { likeCount: trip.likeCount }),
    ...(trip.reviewRecords && { reason: trip.reviewRecords.reason }),
  };
};

export const ListResponse = (trip, user) => {
  return {
    id: trip.id,
    title: trip.title,
    coverImage: trip.coverImage,
    status: trip.status,
    updataTime: trip.update_time,
    likeCount: trip.likeCount,
    isLiked: trip.isLiked || false,
    author: {
      id: user.id,
      nickname: user.nick_name,
      avatar: user.icon,
    },
    ...(trip.reviewRecords && { reason: trip.reviewRecords.reason }),
  };
};
