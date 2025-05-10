import { getTravelList } from '@/api/travel';
import { TravelItem } from '@/mock/travel';
import { create } from 'zustand';

interface TravelState {
  list: (TravelItem & { isLiked?: boolean })[];
  total: number;
  loading: boolean;
  keyword: string;
  page: number;
  pageSize: number;
  setKeyword: (keyword: string) => void;
  fetchList: () => Promise<void>;
  loadMore: () => Promise<void>;
  updateLikeStatus: (travelId: number, isLiked: boolean, likeCount: number) => void; // 添加更新点赞状态的方法
}

export const useTravelStore = create<TravelState>((set, get) => ({
  list: [],
  total: 0,
  loading: false,
  keyword: '',
  page: 1,
  pageSize: 10,

  setKeyword: (keyword) => {
    set({ keyword, page: 1, list: [] });
  },

  fetchList: async () => {
    const { keyword, page, pageSize } = get();
    set({ loading: true });
    try {
      const response = await getTravelList({
        page,
        pageSize,
        keyword,
        userId: JSON.parse(localStorage.getItem('user-storage') || '{}')?.state?.userInfo?.id,
      });

      set({
        list: page === 1 ? response.data.list : [...get().list, ...response.data.list],
        total: response.data.total,
      });
    } catch (error) {
      console.error('获取游记列表失败:', error);
    } finally {
      set({ loading: false });
    }
  },

  loadMore: async () => {
    const { page, total, list, loading } = get();
    if (list.length >= total) return;
    if (loading) return; // 🔥 正在加载就禁止
    if (page === 1 && list.length === 0) return; // 🔥 刚初始化时禁止
    set({ page: page + 1 });
    await get().fetchList();
  },
  // 添加更新点赞状态的方法
  updateLikeStatus: (travelId: number, isLiked: boolean, likeCount: number) => {
    // console.log('updateLikeStatus', travelId, isLiked, likeCount);
    const { list } = get();
    const newList = list.map((travel) =>
      travel.id === travelId
        ? {
            ...travel,
            isLiked,
            likeCount,
          }
        : travel,
    );
    // console.log('newList', newList);
    set({ list: newList });
    // setTimeout(() => {
    //   const updatedList = get().list;
    //   console.log('更新后的列表:', updatedList);
    // }, 0);
  },
}));
