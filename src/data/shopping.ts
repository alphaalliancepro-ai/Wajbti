import type { ShoppingTemplateItem } from '../types';

export interface ShoppingWeek {
  weekIndex: number;
  label: string;
  subtitle: string;
  items: ShoppingTemplateItem[];
}

export const SHOPPING_WEEKS: ShoppingWeek[] = [
  {
    weekIndex: 0,
    label: 'الأسبوع الأول',
    subtitle: 'أساسيات البروتين، الشوفان والغلال والبقوليات',
    items: [
      { id: 'w0-0', name: 'عظمات', quantity: '20 حبة', defaultPrice: 8.0, category: 'بروتينات', imageKey: 'eggs' },
      { id: 'w0-1', name: 'صدر دجاج / إسكالوب', quantity: '1 كغ', defaultPrice: 13.0, category: 'بروتينات', imageKey: 'chicken' },
      { id: 'w0-2', name: 'سردينة طازجة', quantity: '500غ', defaultPrice: 5.0, category: 'بروتينات', imageKey: 'sardines' },
      { id: 'w0-3', name: 'تن (معلب)', quantity: 'علبتين', defaultPrice: 5.0, category: 'بروتينات', imageKey: 'salad' },
      { id: 'w0-4', name: 'عدس يابس', quantity: '500غ', defaultPrice: 2.5, category: 'حبوب وبقوليات', imageKey: 'lentils' },
      { id: 'w0-5', name: 'حمص يابس', quantity: '250غ', defaultPrice: 1.5, category: 'حبوب وبقوليات', imageKey: 'lentils' },
      { id: 'w0-6', name: 'حليب نصف دسم', quantity: '2 لتر', defaultPrice: 3.0, category: 'حليب ومشتقاته', imageKey: 'oats' },
      { id: 'w0-7', name: 'ياغورت طبيعي', quantity: '7 حبات', defaultPrice: 3.5, category: 'حليب ومشتقاته', imageKey: 'yogurt' },
      { id: 'w0-8', name: 'روز', quantity: '500غ', defaultPrice: 2.0, category: 'حبوب وبقوليات', imageKey: 'chicken' },
      { id: 'w0-9', name: 'بطاطا', quantity: '1.5 كغ', defaultPrice: 3.0, category: 'خضرة وغلة', imageKey: 'sardines' },
      { id: 'w0-10', name: 'خبز قمح كامل', quantity: 'حسب الحاجة', defaultPrice: 4.0, category: 'حبوب وبقوليات', imageKey: 'sandwich' },
      { id: 'w0-11', name: 'طماطم وفلفل', quantity: '1.5 كغ', defaultPrice: 4.0, category: 'خضرة وغلة', imageKey: 'ojja' },
      { id: 'w0-12', name: 'بصل وجزر ومعدنوس', quantity: '1 كغ', defaultPrice: 2.5, category: 'خضرة وغلة', imageKey: 'chorba' },
      { id: 'w0-13', name: 'غلة موسمية (موز وتفاح)', quantity: '1 كغ', defaultPrice: 4.0, category: 'خضرة وغلة', imageKey: 'yogurt' },
      { id: 'w0-14', name: 'شوفان', quantity: '250غ', defaultPrice: 2.5, category: 'حبوب وبقوليات', imageKey: 'oats' },
    ],
  },
  {
    weekIndex: 1,
    label: 'الأسبوع الثاني',
    subtitle: 'تنويع باللوبيا، الحوت الموسمي والمقرونة',
    items: [
      { id: 'w1-0', name: 'عظمات', quantity: '20 حبة', defaultPrice: 8.0, category: 'بروتينات', imageKey: 'eggs' },
      { id: 'w1-1', name: 'صدر دجاج', quantity: '1 كغ', defaultPrice: 13.0, category: 'بروتينات', imageKey: 'chicken' },
      { id: 'w1-2', name: 'حوت موسمي (بوري أو ماكرو)', quantity: '500غ', defaultPrice: 7.0, category: 'بروتينات', imageKey: 'sardines' },
      { id: 'w1-3', name: 'تن', quantity: 'علبة', defaultPrice: 2.5, category: 'بروتينات', imageKey: 'salad' },
      { id: 'w1-4', name: 'لوبيا يابسة', quantity: '500غ', defaultPrice: 3.0, category: 'حبوب وبقوليات', imageKey: 'lentils' },
      { id: 'w1-5', name: 'عدس', quantity: '500غ', defaultPrice: 2.5, category: 'حبوب وبقوليات', imageKey: 'lentils' },
      { id: 'w1-6', name: 'حليب', quantity: '2 لتر', defaultPrice: 3.0, category: 'حليب ومشتقاته', imageKey: 'oats' },
      { id: 'w1-7', name: 'ياغورت طبيعي', quantity: '7 حبات', defaultPrice: 3.5, category: 'حليب ومشتقاته', imageKey: 'yogurt' },
      { id: 'w1-8', name: 'مقرونة', quantity: '500غ', defaultPrice: 2.0, category: 'حبوب وبقوليات', imageKey: 'pasta' },
      { id: 'w1-9', name: 'بطاطا', quantity: '1.5 كغ', defaultPrice: 3.0, category: 'خضرة وغلة', imageKey: 'sardines' },
      { id: 'w1-10', name: 'خبز كامل', quantity: 'حسب الحاجة', defaultPrice: 4.0, category: 'حبوب وبقوليات', imageKey: 'sandwich' },
      { id: 'w1-11', name: 'خضرة موسمية مشكلة', quantity: '2 كغ', defaultPrice: 5.0, category: 'خضرة وغلة', imageKey: 'ojja' },
      { id: 'w1-12', name: 'غلة موسمية', quantity: '1 كغ', defaultPrice: 4.0, category: 'خضرة وغلة', imageKey: 'yogurt' },
      { id: 'w1-13', name: 'شوفان', quantity: '250غ', defaultPrice: 2.5, category: 'حبوب وبقوليات', imageKey: 'oats' },
    ],
  },
  {
    weekIndex: 2,
    label: 'الأسبوع الثالث',
    subtitle: 'أسبوع الكسكسي الصحي، الفريك والحمص',
    items: [
      { id: 'w2-0', name: 'عظمات', quantity: '20 حبة', defaultPrice: 8.0, category: 'بروتينات', imageKey: 'eggs' },
      { id: 'w2-1', name: 'دجاج', quantity: '1 كغ', defaultPrice: 13.0, category: 'بروتينات', imageKey: 'chicken' },
      { id: 'w2-2', name: 'سردينة', quantity: '500غ', defaultPrice: 5.0, category: 'بروتينات', imageKey: 'sardines' },
      { id: 'w2-3', name: 'حمص', quantity: '500غ', defaultPrice: 3.0, category: 'حبوب وبقوليات', imageKey: 'lentils' },
      { id: 'w2-4', name: 'عدس', quantity: '500غ', defaultPrice: 2.5, category: 'حبوب وبقوليات', imageKey: 'lentils' },
      { id: 'w2-5', name: 'حليب', quantity: '2 لتر', defaultPrice: 3.0, category: 'حليب ومشتقاته', imageKey: 'oats' },
      { id: 'w2-6', name: 'ياغورت طبيعي', quantity: '7 حبات', defaultPrice: 3.5, category: 'حليب ومشتقاته', imageKey: 'yogurt' },
      { id: 'w2-7', name: 'روز', quantity: '500غ', defaultPrice: 2.0, category: 'حبوب وبقوليات', imageKey: 'chicken' },
      { id: 'w2-8', name: 'كسكسي', quantity: '500غ', defaultPrice: 2.5, category: 'حبوب وبقوليات', imageKey: 'couscous' },
      { id: 'w2-9', name: 'بطاطا', quantity: '1.5 كغ', defaultPrice: 3.0, category: 'خضرة وغلة', imageKey: 'sardines' },
      { id: 'w2-10', name: 'خبز كامل', quantity: 'حسب الحاجة', defaultPrice: 4.0, category: 'حبوب وبقوليات', imageKey: 'sandwich' },
      { id: 'w2-11', name: 'طماطم وفلفل وخضرة كسكسي', quantity: '1.5 كغ', defaultPrice: 4.0, category: 'خضرة وغلة', imageKey: 'couscous' },
      { id: 'w2-12', name: 'غلة', quantity: '1 كغ', defaultPrice: 4.0, category: 'خضرة وغلة', imageKey: 'yogurt' },
      { id: 'w2-13', name: 'شوفان وفريك', quantity: '350غ', defaultPrice: 3.0, category: 'حبوب وبقوليات', imageKey: 'chorba' },
    ],
  },
  {
    weekIndex: 3,
    label: 'الأسبوع الرابع',
    subtitle: 'اللمسة الأخيرة لتحقيق هدف 30 يوم',
    items: [
      { id: 'w3-0', name: 'عظمات', quantity: '20 حبة', defaultPrice: 8.0, category: 'بروتينات', imageKey: 'eggs' },
      { id: 'w3-1', name: 'دجاج', quantity: '1 كغ', defaultPrice: 13.0, category: 'بروتينات', imageKey: 'chicken' },
      { id: 'w3-2', name: 'حوت موسمي', quantity: '500غ', defaultPrice: 7.0, category: 'بروتينات', imageKey: 'sardines' },
      { id: 'w3-3', name: 'تن', quantity: 'علبتين', defaultPrice: 5.0, category: 'بروتينات', imageKey: 'salad' },
      { id: 'w3-4', name: 'لوبيا', quantity: '500غ', defaultPrice: 3.0, category: 'حبوب وبقوليات', imageKey: 'lentils' },
      { id: 'w3-5', name: 'عدس', quantity: '500غ', defaultPrice: 2.5, category: 'حبوب وبقوليات', imageKey: 'lentils' },
      { id: 'w3-6', name: 'حليب', quantity: '2 لتر', defaultPrice: 3.0, category: 'حليب ومشتقاته', imageKey: 'oats' },
      { id: 'w3-7', name: 'ياغورت وفروماج بلان', quantity: '7 حبات', defaultPrice: 4.0, category: 'حليب ومشتقاته', imageKey: 'yogurt' },
      { id: 'w3-8', name: 'مقرونة', quantity: '500غ', defaultPrice: 2.0, category: 'حبوب وبقوليات', imageKey: 'pasta' },
      { id: 'w3-9', name: 'بطاطا', quantity: '1.5 كغ', defaultPrice: 3.0, category: 'خضرة وغلة', imageKey: 'sardines' },
      { id: 'w3-10', name: 'خبز كامل', quantity: 'حسب الحاجة', defaultPrice: 4.0, category: 'حبوب وبقوليات', imageKey: 'sandwich' },
      { id: 'w3-11', name: 'خضرة موسمية', quantity: '2 كغ', defaultPrice: 5.0, category: 'خضرة وغلة', imageKey: 'ojja' },
      { id: 'w3-12', name: 'غلة', quantity: '1 كغ', defaultPrice: 4.0, category: 'خضرة وغلة', imageKey: 'yogurt' },
      { id: 'w3-13', name: 'شوفان وبسيسة', quantity: '300غ', defaultPrice: 3.0, category: 'حبوب وبقوليات', imageKey: 'oats' },
    ],
  },
];
