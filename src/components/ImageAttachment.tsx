import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export type AttachedImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string;
};

type Props = {
  images: AttachedImage[];
  onChangeImages: (images: AttachedImage[]) => void;
  maxCount?: number;
};

export default function ImageAttachment({
  images,
  onChangeImages,
  maxCount = 5,
}: Props) {
  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('알림', '사진 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: maxCount - images.length,
    });

    if (result.canceled) return;

    const selectedImages = result.assets.map((asset) => ({
      uri: asset.uri,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
    }));

    onChangeImages([...images, ...selectedImages].slice(0, maxCount));
  };

  const removeImage = (targetUri: string) => {
    onChangeImages(images.filter((image) => image.uri !== targetUri));
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.attachButton,
          images.length >= maxCount && styles.disabledButton,
        ]}
        onPress={pickImages}
        disabled={images.length >= maxCount}
      >
        <Text style={styles.attachText}>
          사진 첨부 {images.length}/{maxCount}
        </Text>
      </Pressable>

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
