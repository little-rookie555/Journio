import { getUserTravels, likeTravel } from '@/api/travel';
import { getUserInfo } from '@/api/user';
import TravelCardList from '@/components/TravelCardList';
import { useTheme } from '@/contexts/ThemeContext';
import { useTravelStore } from '@/store/travel';
import { useUserStore } from '@/store/user';
import { Button, DotLoading, Image, NavBar, Toast } from 'antd-mobile';
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
  const [profileUser, setProfileUser] = useState<any>(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [travelList, setTravelList] = useState<any[]>([]);
  const isOwnProfile = userInfo?.id === Number(userId);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!userId) return;

      try {
        const res = await getUserInfo(Number(userId));
        if (res.code === 200) {
          setProfileUser({
            ...res.data,
            followingCount: res.data.followingCount,
            followerCount: res.data.fanCount,
            likeCount: res.data.likedCount,
            startCount: res.data.starredCount,
            bio: res.data.desc,
          });
        }
      } catch (error: any) {
        Toast.show({
          icon: 'fail',
          content: error?.message || '获取用户信息失败',
        });
      }
    };

    const fetchUserTravels = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const res = await getUserTravels(Number(userId));
        if (res.code === 200) {
          // 只显示已通过的游记
          // console.log(res.data);
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

    fetchUserInfo();
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
      const res = await likeTravel({
        travelId: item.id,
        userId: userInfo.id,
        liked: !item.isLiked,
      });
      if (res.code === 200) {
        // 更新全局状态
        updateLikeStatus(item.id, res.data.liked, res.data.likeCount);

        // 更新本地状态
        setTravelList((prevList) =>
          prevList.map((travel) =>
            travel.id === item.id
              ? { ...travel, isLiked: res.data.liked, likeCount: res.data.likeCount }
              : travel,
          ),
        );
      }
    } catch (error: any) {
      Toast.show({
        icon: 'fail',
        content: error?.message || '操作失败',
      });
    }
  };

  return (
    <div className={`profile-page ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="header-container">
        <NavBar
          onBack={() => navigate(-1)}
          right={<SendOutline fontSize={24} onClick={handleShare} />}
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
              <div className="bio">{profileUser?.desc || '这个人很懒，还没有填写简介'}</div>
            </div>
          </div>

          <div className="user-actions">
            <div className="stats">
              <div
                className="stat-item"
                onClick={() => {
                  navigate(`/following/${userId}`);
                }}
              >
                <div className="stat-value">{profileUser?.followingCount || 0}</div>
                <div className="stat-label">关注</div>
              </div>
              <div
                className="stat-item"
                onClick={() => {
                  navigate(`/following/${userId}?tab=fans`);
                }}
              >
                <div className="stat-value">{profileUser?.followerCount || 0}</div>
                <div className="stat-label">粉丝</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {profileUser?.likeCount + profileUser?.starredCount || 0}
                </div>
                <div className="stat-label">获赞与收藏</div>
              </div>
            </div>
            {!isOwnProfile && (
              <Button
                size="small"
                style={{ width: '80px' }}
                color={isFollowed ? 'default' : 'primary'}
                fill={isFollowed ? 'outline' : 'solid'}
                onClick={handleFollow}
                className="follow-btn"
              >
                {isFollowed ? '已关注' : '关注'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="travel-list">
        <div className="travel-list">
          <TravelCardList
            list={travelList}
            loading={loading}
            emptyText={isOwnProfile ? '快来分享你的旅行故事吧' : '该用户还没有发布游记'}
            onLike={handleLike}
            userInfo={userInfo}
          />
        </div>

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
