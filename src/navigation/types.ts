export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Attendance: undefined;
  Approval: undefined;
};

export type AttendanceStackParamList = {
  AttendanceMain: undefined;
  AttendanceDetail: {
    workDate?: string;
  };
};

export type ApprovalStackParamList = {
  ApprovalList: undefined;
  ApprovalDetail: {
    apprNo?: string;
  };
};
