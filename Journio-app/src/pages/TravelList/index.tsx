import { likeTravel } from '@/api/travel';
import TravelCardList from '@/components/TravelCardList';
import { useTheme } from '@/contexts/ThemeContext';
import { useTravelStore } from '@/store/travel';
import { useUserStore } from '@/store/user';
import { InfiniteScroll, SearchBar, Toast } from 'antd-mobile';
import React, { useCallback, useEffect, useState } from 'react';
import './index.scss';
const TravelList: React.FC = () => {
  const { theme } = useTheme();
  const { list, loading, total, keyword, setKeyword, fetchList, loadMore, updateLikeStatus } =
    useTravelStore();
  const [searchValue, setSearchValue] = useState(keyword);
  const { userInfo } = useUserStore();

  useEffect(() => {
    // 只在第一次加载时获取数据
    if (!list.length) {
      fetchList();
    }
  }, []); // 移除 fetchList 依赖

  const handleSearch = useCallback(
    (value: string) => {
      setKeyword(value);
      fetchList();
    },
    [setKeyword, fetchList],
  );

  const hasMore = list.length < total;

  const handleLike = useCallback(
    async (item: any, liked: boolean) => {
      try {
        const res = await likeTravel({
          travelId: item.id,
          userId: userInfo!.id,
          liked,
        });
        if (res.code === 200) {
          updateLikeStatus(item.id, res.data.liked, res.data.likeCount);
        }
      } catch (error: any) {
        Toast.show({
          icon: 'fail',
          content: error?.message || '操作失败',
        });
      }
    },
    [userInfo, updateLikeStatus],
  );

  return (
    <div className={`travel-list ${theme === 'dark' ? 'dark' : ''}`}>
      <SearchBar
        placeholder="搜索游记标题或作者"
        value={searchValue}
        onChange={setSearchValue}
        onSearch={handleSearch}
        className="search-bar"
        style={{
          '--background': theme === 'dark' ? 'var(--adm-color-box)' : '#fff',
          '--border-radius': '8px',
        }}
      />
      <TravelCardList
        list={list}
        loading={loading}
        emptyText="快来分享你的旅行故事吧"
        onLike={handleLike}
        userInfo={userInfo}
      />

      <InfiniteScroll loadMore={loadMore} hasMore={hasMore} threshold={100} />
    </div>
  );
};

export default TravelList;
