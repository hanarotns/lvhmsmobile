export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
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
  ApprovalMain: undefined;
  ApprovalDetail: {
    apprNo?: string;
  };
};
