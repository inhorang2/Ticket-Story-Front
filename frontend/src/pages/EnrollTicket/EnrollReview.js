import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView
} from 'react-native';
import EnrollHeader from '../../components/EnrollTicket/EnrollHeader';
import SliderRating from '../../components/EnrollTicket/SliderRating';
import addPhoto from '../../images/icon_add_photo.png';
import deleteIcon from '../../images/icon_delete_photo.png';
import {launchImageLibrary} from 'react-native-image-picker';
import NextButton from '../../components/EnrollTicket/NextBtn';
import CustomCheckbox from '../../components/EnrollTicket/CustomCheckbox';

const EnrollReview = ({navigation, route}) => {
  const { title, action } = route.params;

  const [sliderTouched, setSliderTouched] = useState(false);

  const [artRating, setArtRating] = useState(0);
  const [seatRating, setSeatRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [spoilerChecked, setSpoilerChecked] = useState(false);
  const [privateChecked, setPrivateChecked] = useState(false);

  const handleSliderChange = (category, rating) => {
    if (category === 'art') {
      setArtRating(rating);
    } else if (category === 'seat') {
      setSeatRating(rating);
    }
    setSliderTouched(true);
  };

  const handleNext = () => {
    if (action === 'camera') {
      const { categoryInfo } = route.params;
      navigation.navigate('EnrollInfoByOCR', {categoryInfo});
    } else {
      navigation.navigate('EnrollFinish');
    }
  }

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo',
      cameraType: 'back',
      selectionLimit: 3,
      title: 'Select Images',
      mediaType: 'photo',
      quality: 0.8,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const images = response.assets.map(asset => asset.uri);
        setSelectedImages(images);
      }
    }
    );
  };

  const handleImageDelete = index => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };

  return (
    <>
      <EnrollHeader title="티켓 후기 입력" onIconClick={handleNext} />
      <ScrollView style={styles.container}>
        <Text style={{fontSize: 16, fontWeight: 'bold', color: '#525252', lineHeight: 24}}>
          관람한 <Text style={{color: '#5D70F9'}}>{title || '콘텐츠'}</Text>의 후기를 알려주세요.
        </Text>
        <Text style={{ fontSize: 12, color: '#939393' }}>*표시는 필수 항목입니다.</Text>

        <SliderRating category="art" value={artRating} onValueChange={handleSliderChange} />

        <SliderRating category="seat" value={seatRating} onValueChange={handleSliderChange} />
        
        <Text style={styles.sectionText}>작품 후기</Text>

        <View style={styles.reviewImageContainer}>
          <View>
            <TouchableOpacity onPress={handleImagePicker}>
              <Image source={addPhoto} style={styles.image} />
            </TouchableOpacity>
            <Text style={{ width: 48, textAlign: 'center' }}>{selectedImages.length} / 3</Text>
          </View>
          <FlatList
            data={selectedImages}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            renderItem={({ item, index }) => (
              <View key={index} style={styles.previewImageContainer}>
                <Image source={{ uri: item }} style={styles.previewImage} />
                <TouchableOpacity onPress={() => handleImageDelete(index)} style={styles.deleteIconContainer}>
                  <Image source={deleteIcon} style={styles.deleteIcon} />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
        <View style={styles.reviewTextContainer}>
          <TextInput
            style={{...styles.inputArea, height: 30, fontSize: 16, fontWeight: 'bold', color: '#525252'}}
            value={reviewTitle}
            placeholder = "제목"
            placeholderTextColor = "#525252"
            onChangeText={text => setReviewTitle(text)}
          />
          <TextInput
            style={{...styles.inputArea, flex: 1}}
            multiline={true}
            placeholder="관람 후기를 입력해주세요"
            value={reviewContent}
            onChangeText={text => setReviewContent(text)}
          />
        </View>

        <View style={styles.checkboxContainer}>
          <CustomCheckbox
            checked={spoilerChecked}
            onPress={() => setSpoilerChecked(!spoilerChecked)}
            label="스포일러 포함"
          />
          <CustomCheckbox
            checked={privateChecked}
            onPress={() => setPrivateChecked(!privateChecked)}
            label="비공개"
          />
        </View>

        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20}} >
          <NextButton  isDisabled={(artRating === 0 || seatRating === 0) && sliderTouched} onPress={handleNext} />
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 27,
    paddingVertical: 12,
  },
  sectionText: {
    fontSize: 16,
    marginTop: 5,
    color: '#000',
  },
  image: {
    width: 48,
    height: 48,
    marginTop: 10,
  },
  inputArea: {
    width: '100%',
  },
  reviewImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
  },
  deleteIconContainer: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'transparent',
  },
  deleteIcon: {
    width: 14,
    height: 14,
  },
  previewImageContainer: {
    marginRight: 8,
    position: 'relative',
  },
  previewImage: {
    width: 72,
    height: 72,
    borderRadius: 5,
  },
  reviewTextContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    height: 250,
    marginVertical: 11,
    padding: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default EnrollReview;