// src/theme/calendarTheme.ts
import { LVColors } from '@/src/components';

export const calendarTheme = {
  backgroundColor: '#6f6161ff',
  calendarBackground: '#ffffff',

  textSectionTitleColor: '#b6c1cd',
  selectedDayBackgroundColor: LVColors.primary,
  selectedDayTextColor: '#ffffff',
  todayTextColor: LVColors.primary,
  dayTextColor: '#2d4150',
  monthTextColor: '#454D58',

  textDayFontWeight: '500',
  textDayHeaderFontWeight: '600',
  textMonthFontWeight: '600',
  textMonthFontSize: 20,

  'stylesheet.calendar.header': {
    dayTextAtIndex0: {
      color: '#FF585B',
    },
    dayTextAtIndex6: {
      color: '#FF585B',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  },
};
