import { getUserTravels } from '@/api/travel';
import LikeButton from '@/components/LikeButton';
import { useTheme } from '@/contexts/ThemeContext';
import { useTravelStore } from '@/store/travel';
import { useUserStore } from '@/store/user';
import { Avatar, Button, DotLoading, Image, NavBar, Result, Toast } from 'antd-mobile';
import { SendOutline } from 'antd-mobile-icons';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './index.scss';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { userInfo } = useUserStore();
  const { updateLikeStatus } = useTravelStore();
  const [profileUser] = useState<any>(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [travelList, setTravelList] = useState<any[]>([]);
  const isOwnProfile = userInfo?.id === Number(userId);

  useEffect(() => {
    const fetchUserTravels = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const res = await getUserTravels(Number(userId));
        if (res.code === 200) {
          // 只显示已通过的游记
          console.log(res.data);
          const approvedTravels = res.data.filter((item) => item.status === 1);
          setTravelList(approvedTravels);
        }
      } catch (error: any) {
        Toast.show({
          icon: 'fail',
          content: error?.message || '获取游记失败',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserTravels();
  }, [userId]);

  const handleFollow = async () => {
    if (!userInfo) {
      Toast.show({
        content: '请先登录',
        icon: 'fail',
      });
      navigate('/login');
      return;
    }
    // TODO: 处理关注/取消关注
    setIsFollowed(!isFollowed);
  };

  const handleShare = () => {
    Toast.show({
      content: '分享功能开发中',
    });
  };

  const handleLike = async (item: any) => {
    if (!userInfo) {
      Toast.show({
        content: '请先登录',
        icon: 'fail',
      });
      navigate('/login');
      return;
    }

    try {
      // TODO: 处理点赞
      updateLikeStatus(item.id, !item.isLiked, item.likeCount + (item.isLiked ? -1 : 1));
    } catch (error: any) {
      Toast.show({
        icon: 'fail',
        content: error?.message || '操作失败',
      });
    }
  };

  const renderCard = (item: any) => (
    <div key={item.id} className="travel-card" onClick={() => navigate(`/detail/${item.id}`)}>
      <Image src={item.coverImage} className="travel-image" />
      <div className="travel-info">
        <h3 className="travel-title">{item.title}</h3>
        <div className="card-bottom">
          <div className="author-info">
            <Avatar src={item.author.avatar} />
            <span className="author-name">{item.author.nickname}</span>
          </div>
          <div className="action-item" onClick={(e) => e.stopPropagation()}>
            <LikeButton
              isLiked={item.isLiked}
              onChange={() => handleLike(item)}
              likeCount={item.likeCount}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const leftList = travelList.filter((_, index) => index % 2 === 0);
  const rightList = travelList.filter((_, index) => index % 2 === 1);

  return (
    <div className={`profile-page ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="header-container">
        <NavBar
          onBack={() => navigate(-1)}
          right={
            isOwnProfile ? (
              <SendOutline fontSize={24} onClick={handleShare} />
            ) : (
              <div className="header-actions">
                <Button
                  size="small"
                  color={isFollowed ? 'default' : 'primary'}
                  fill={isFollowed ? 'outline' : 'solid'}
                  onClick={handleFollow}
                  className="follow-btn"
                >
                  {isFollowed ? '已关注' : '关注'}
                </Button>
                <SendOutline fontSize={24} onClick={handleShare} />
              </div>
            )
          }
        >
          {isOwnProfile ? '我的主页' : '用户主页'}
        </NavBar>
      </div>

      <div className="user-profile">
        <div className="profile-main">
          <div className="user-info">
            <Image src={profileUser?.avatar} className="profile-avatar" />
            <div className="user-detail">
              <div className="nickname">{profileUser?.nickname}</div>
              <div className="bio">{profileUser?.bio || '这个人很懒，还没有填写简介'}</div>
            </div>
          </div>

          <div className="user-actions">
            <div className="stats">
              <div className="stat-item">
                <div className="stat-value">{profileUser?.followingCount || 0}</div>
                <div className="stat-label">关注</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{profileUser?.followerCount || 0}</div>
                <div className="stat-label">粉丝</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{profileUser?.likeCount || 0}</div>
                <div className="stat-label">获赞与收藏</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="travel-list">
        {travelList.length === 0 && !loading ? (
          <Result
            status="info"
            title="暂无游记"
            description={isOwnProfile ? '快来分享你的旅行故事吧' : '该用户还没有发布游记'}
          />
        ) : (
          <div className="masonry-grid">
            <div className="masonry-column">{leftList.map(renderCard)}</div>
            <div className="masonry-column">{rightList.map(renderCard)}</div>
          </div>
        )}

        {loading && (
          <div className="loading">
            <span>加载中</span>
            <DotLoading />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
