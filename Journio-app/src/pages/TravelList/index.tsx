import { likeTravel } from '@/api/travel';
import LikeButton from '@/components/LikeButton';
import { useTheme } from '@/contexts/ThemeContext';
import { useTravelStore } from '@/store/travel';
import { useUserStore } from '@/store/user';
import { Avatar, DotLoading, Image, InfiniteScroll, Result, SearchBar, Toast } from 'antd-mobile';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';

const TravelList: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { list, loading, total, keyword, setKeyword, fetchList, loadMore, updateLikeStatus } =
    useTravelStore();
  const [searchValue, setSearchValue] = useState(keyword);
  const { userInfo } = useUserStore();

  useEffect(() => {
    // console.log('list', list);
    fetchList();
  }, [fetchList]);

  const handleSearch = (value: string) => {
    setKeyword(value);
    fetchList();
  };

  const hasMore = list.length < total;

  // 将列表分成左右两列
  const leftList = list.filter((_, index) => index % 2 === 0);
  const rightList = list.filter((_, index) => index % 2 === 1);

  // 添加登录检查工具函数
  const checkLogin = () => {
    if (!userInfo) {
      Toast.show({
        content: '请先登录',
        icon: 'fail',
      });
      navigate('/login');
      return false;
    }
    return true;
  };

  // 处理点赞
  const handleLike = async (item: any) => {
    if (!checkLogin()) return;

    try {
      const res = await likeTravel({
        travelId: item.id,
        userId: userInfo!.id,
        liked: !item.isLiked,
      });
      if (res.code === 200) {
        updateLikeStatus(item.id, res.data.liked, res.data.likeCount);
        console.log('点赞成功');
      }
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
              onChange={() => {
                handleLike(item);
              }}
              likeCount={item.likeCount}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`travel-list ${theme === 'dark' ? 'dark' : ''}`}>
      <SearchBar
        placeholder="搜索游记标题或作者"
        value={searchValue}
        onChange={(value) => setSearchValue(value)}
        onSearch={handleSearch}
        className="search-bar"
        style={{
          '--background': theme === 'dark' ? 'var(--adm-color-box)' : '#fff',
          '--border-radius': '8px',
        }}
      />

      {list.length === 0 && !loading ? (
        <Result status="info" title="暂无游记" description="快来分享你的旅行故事吧" />
      ) : (
        <div className="masonry-grid">
          <div className="masonry-column">{leftList.map(renderCard)}</div>
          <div className="masonry-column">{rightList.map(renderCard)}</div>
        </div>
      )}

      <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
        {loading ? (
          <div className="loading">
            <span>加载中</span>
            <DotLoading />
          </div>
        ) : null}
      </InfiniteScroll>
    </div>
  );
};

export default TravelList;
