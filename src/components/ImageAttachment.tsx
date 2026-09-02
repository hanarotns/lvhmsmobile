import { Util } from '@/src/lib';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LVButton from './LVButton';

export type AttachedImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string;
};

type Props = {
  images: AttachedImage[];
  onChangeImages: (images: AttachedImage[]) => void;
  maxCount?: number;
  setFileList?: object;
};

export default function ImageAttachment({
  images,
  onChangeImages,
  maxCount = 5,
  setFileList,
}: Props) {
  const onPressPhotoAdd = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: maxCount - images.length,
    });

    if (result.canceled) return;

    const selectedImages = result.assets.map((asset) => ({
      ...asset,
    }));

    const pickedFile = result.assets?.[0];

    if (!pickedFile) {
      return;
    }

    if ((pickedFile.fileSize ?? 0) > 5242880) {
      Util.toastMsg('파일 크기는 5MB 이하여야 합니다.', 'error');
      return;
    }

    setFileList((prev) => [
      ...prev,
      {
        seq: String(prev.length + 1).padStart(2, '0'),
        fileName: pickedFile.fileName,
        fileSize: `${Math.round((pickedFile.fileSize ?? 0) / 1024)}KB`,
        uri: pickedFile.uri,
        type: pickedFile.mimeType || 'application/octet-stream',
        size: pickedFile.fileSize ?? 0,
        uploaded: false,
      },
    ]);

    onChangeImages([...images, ...selectedImages].slice(0, maxCount));
  };

  const removeImage = (targetUri: string) => {
    onChangeImages(images.filter((image) => image.uri !== targetUri));
  };

  return (
    <View style={styles.container}>
      <LVButton title='가져오기' onPress={onPressPhotoAdd} />

      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.previewList}>
            {images.map((image) => (
              <View key={image.uri} style={styles.previewItem}>
                <Image source={{ uri: image.uri }} style={styles.image} />

                <Pressable
                  style={styles.removeButton}
                  onPress={() => removeImage(image.uri)}
                >
                  <Text style={styles.removeText}>×</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  attachButton: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  attachText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#344054',
  },
  previewList: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 16,
  },
  previewItem: {
    position: 'relative',
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: 8,
    backgroundColor: '#F2F4F7',
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#101828',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 18,
  },
});
