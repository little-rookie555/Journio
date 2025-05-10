import { create } from 'zustand';

interface TemplateStore {
  templates: string[];
  fetchTemplates: () => Promise<void>;
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  templates: [
    `📍景点地址：景点所在的详细地址，若有必要可再补充标识\n🚗景点交通：交通工具选择、交通路线推荐等\n👍必去景点：必打卡的项目或景点\n🎫门票相关：门票收费情况说明\n❤️其他tips：景区卫生情况、预算、防晒、保险、穿搭等`,
    `📍景点地址：景点所在的详细地址，若有必要可再补充标识\n🚗交通攻略：交通工具选择、交通路线推荐等\n📝预约攻略：预约方式和经验心得\n❤️其他tips：景区卫生情况、预算、防晒、保险、穿搭等`,
    `🏞️景点特色：景点的主要特色和亮点\n🕧景区开放时间：具体的营业时间\n🚗路线推荐：建议游玩路线和时间安排\n❤️其他tips：景区卫生情况、预算、防晒、保险、穿搭等`,
    `🌈知名特色：当地有名的特色美食\n🍴推荐餐厅：推荐的餐厅名称和位置\n❤️其他tips：餐厅卫生情况、预算、排队等注意事项`,
    `👍必打卡店铺：必去的特色店铺\n🕧打卡时间：建议的用餐时间\n💰人均价格：参考的人均消费\n❤️其他tips：餐厅卫生情况、预算、排队等注意事项`,
  ],
  fetchTemplates: async () => {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      set({ templates: data });
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  },
}));
