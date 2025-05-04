import { useTravelStore } from '@/store/travel';
import { Avatar, DotLoading, Image, InfiniteScroll, Result, SearchBar } from 'antd-mobile';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';

const TravelList: React.FC = () => {
  const navigate = useNavigate();
  const { list, loading, total, keyword, setKeyword, fetchList, loadMore } = useTravelStore();
  const [searchValue, setSearchValue] = useState(keyword);

  useEffect(() => {
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

  const renderCard = (item: any) => (
    <div key={item.id} className="travel-card" onClick={() => navigate(`/detail/${item.id}`)}>
      <Image src={item.coverImage} className="travel-image" />
      <div className="travel-info">
        <h3 className="travel-title">{item.title}</h3>
        <div className="author-info">
          <Avatar src={item.author.avatar} />
          <span className="author-name">{item.author.nickname}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="travel-list">
      <SearchBar
        placeholder="搜索游记标题或作者"
        value={searchValue}
        onChange={(value) => setSearchValue(value)}
        onSearch={handleSearch}
        className="search-bar"
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
