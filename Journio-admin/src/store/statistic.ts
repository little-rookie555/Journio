import { create } from 'zustand';
import dayjs from 'dayjs';
import {
  getUser,
  getTravel,
  getPendingTravel,
  getList,
  getLike,
  getStar,
  getQualityRate,
} from '@/api/statistic';

interface StatisticState {
  dateRange: [string, string];
  totalUsers: number;
  totalTrips: number;
  totalLikes: number;
  totalStars: number;
  pendingTrips: number;
  dailyData: any[];
  currentPage: number;
  pageSize: number;
  total: number;
  loading: boolean;
  error: string;
  qualityRate: number;

  setDateRange: (range: [string, string]) => void;
  setCurrentPage: (page: number) => void;
  fetchData: () => Promise<void>;
  fetchDailyData: (
    page?: number,
    size?: number,
    startDate?: string,
    endDate?: string,
  ) => Promise<void>;
}

export const useStatisticStore = create<StatisticState>((set, get) => ({
  dateRange: [dayjs().subtract(7, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
  totalUsers: 0,
  totalTrips: 0,
  totalLikes: 0,
  totalStars: 0,
  pendingTrips: 0,
  dailyData: [],
  currentPage: 1,
  pageSize: 10,
  total: 0,
  loading: false,
  error: '',
  qualityRate: 0,

  setDateRange: (range) => set({ dateRange: range }),
  setCurrentPage: (page) => set({ currentPage: page }),

  fetchData: async () => {
    set({ loading: true, error: '' });
    try {
      const [userRes, travelRes, likeRes, starRes, pendingRes, qualityRes] = await Promise.all([
        getUser(),
        getTravel(),
        getLike(),
        getStar(),
        getPendingTravel(),
        getQualityRate(),
      ]);

      set({
        totalUsers: userRes.code === 200 ? userRes.data : 0,
        totalTrips: travelRes.code === 200 ? travelRes.data : 0,
        totalLikes: likeRes.code === 200 ? likeRes.data : 0,
        totalStars: starRes.code === 200 ? starRes.data : 0,
        pendingTrips: pendingRes.code === 200 ? pendingRes.data : 0,
        qualityRate: qualityRes.code === 200 ? qualityRes.data : 0,
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
      set({ error: '获取统计数据失败，请稍后重试' });
    } finally {
      set({ loading: false });
    }
  },

  fetchDailyData: async (
    page = get().currentPage,
    size = get().pageSize,
    startDate = get().dateRange[0],
    endDate = get().dateRange[1],
  ) => {
    set({ loading: true, error: '' });
    try {
      const response = await getList(page, size, startDate, endDate);
      if (response.code === 200 && response.data) {
        const formattedData = response.data.list.map((item) => ({
          date: dayjs(item.date).format('MM-DD'),
          newUsers: item.user || 0,
          newNotes: item.trip || 0,
        }));

        set({
          dailyData: formattedData,
          total: response.data.total,
        });
      }
    } catch (error) {
      console.error('获取每日统计数据失败:', error);
      set({ error: '获取每日统计数据失败，请稍后重试' });
    } finally {
      set({ loading: false });
    }
  },
}));
