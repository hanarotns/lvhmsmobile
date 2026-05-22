import React, {useState, useEffect, useLayoutEffect} from 'react';
import {StyleSheet, Image, View, TouchableOpacity} from 'react-native';
import {Icon, Text, LVLoadingIndicator, Divider} from 'component';
import LVStyles from '~/component/LVStyles';
import LVColors from '~/component/LVColors';
import {AppStore} from '~/store';
import {useRecoilState} from 'recoil';
import {Fetch, Util} from '~/lib';
import * as icon from '~/assets/images';
import {useIsFocused} from '@react-navigation/native';
import * as Action from './Action'; // API통신
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import {useNavigation} from '@react-navigation/native';

const ETC010101 = () => {
  const isFocused = useIsFocused();
  const movingScreen = useNavigation();
  const [session, setSession] = useRecoilState(AppStore.sessionState);
  const [empInfo, setEmpInfo] = useRecoilState(AppStore.empInfoState);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFocused) {
      mount();
    }
  }, [isFocused]);

  const mount = async () => {
    setLoading(true);
    setLoading(false);
  };

  const logout = async () => {
    Fetch.logout().then(result => {
      if (result) {
        setSession(null);
        Util.toastMsg('정상적으로 로그아웃 되었습니다.');
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.safeArea}>
        <View style={styles.section}>
          <TouchableOpacity
            onPress={() => {
              movingScreen.navigate('ETC010201');
            }}
            style={styles.profileCard}>
            <View style={styles.profileLeft}>
              <Image
                style={styles.profileImg}
                source={
                  empInfo?.PICTURE_PATH
                    ? {
                        uri: `http://lv1.htns.com/api/apicall/getDownload/${empInfo?.PICTURE_PATH}`,
                        headers: {
                          'X-CSRF-TOKEN': global.gToken,
                          Cookie: global.gCookie,
                          // withCredentials: true,
                        },
                      }
                    : icon.ico_profile
                }
              />

              <View style={styles.profileContent}>
                <Text style={styles.profileTitleText}>
                  {`${empInfo?.EMP_NAME_LC} ${empInfo?.POSITION_CODE}`}
                </Text>

                <Text style={styles.profileSubText}>{empInfo?.EMP_ID}</Text>
              </View>
            </View>

            <Icon
              name="chevron-right-outline"
              fill="#8F9BB3"
              style={{
                width: 24,
                height: 24,
              }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <TouchableOpacity
            onPress={() => {
              movingScreen.navigate('ETC010301');
            }}
            style={styles.menuButton}>
            <Icon name={'grid-outline'} fill="#373747" style={LVStyles.iconS} />
            <Text style={styles.menuText}>비밀번호 변경</Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity
            onPress={() => {
              movingScreen.navigate('LEA010101');
            }}
            style={styles.menuButton}>
            <Icon name={'grid-outline'} fill="#373747" style={LVStyles.iconS} />
            <Text style={styles.menuText}>연차촉진제 설정</Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity
            onPress={() => {
              movingScreen.navigate('PAL010101');
            }}
            style={styles.menuButton}>
            <Icon name={'grid-outline'} fill="#373747" style={LVStyles.iconS} />
            <Text style={styles.menuText}>결재선 설정</Text>
          </TouchableOpacity>
          <Divider />
        </View>
        <View style={styles.floatingButton}>
          <TouchableOpacity onPress={logout} style={styles.menuButton}>
            <Icon
              name={'power-outline'}
              fill="#373747"
              style={LVStyles.iconS}
            />
            <Text style={styles.menuText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </View>
      {loading && <LVLoadingIndicator />}
    </View>
  );
};
export default ETC010101;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LVColors.white,
  },
  safeArea: {
    flex: 1,
    backgroundColor: LVColors.white,
  },
  scrollView: {
    flex: 1,
    backgroundColor: LVColors.white,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#E5E9F0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  profileImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileContent: {
    marginLeft: 24,
  },
  profileTitleText: {
    fontWeight: '700',
    fontSize: 20,
  },
  profileSubText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#8F9BB3',
  },
  section: {
    margin: 24,
  },
  menuButton: {
    display: 'flex',
    flexDirection: 'row',
    marginVertical: 12,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  menuText: {
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 4,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 32,
    right: 32,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
});
