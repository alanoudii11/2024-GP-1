import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import React from 'react'
import { themeColors } from '../theme';
import * as Icons from "react-native-heroicons/solid";
import { SafeAreaView } from 'react-native-safe-area-context'
import { signOut } from 'firebase/auth'
import { auth } from '../config/firebase'
import TopNavBar2 from '../navigation/TopNavBar2';
import BottomNavBar from '../navigation/BottomNavBar';
import { useNavigation } from '@react-navigation/native'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';


export default function EditProfileScreen() {
    const navigation = useNavigation();
    
    
    const handleLogout = async ()=>{
    await signOut(auth);
  }

  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    username:'',
    email: '',
    phoneNumber:'',
    city:'',
    birthdate:'',
    // Add more fields as needed
  });

  useEffect(() => {
    
    // Fetch user data from Firestore
    const fetchUserData = async () => {
      try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(query(usersRef, where('uid', '==', auth.currentUser.uid)));

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setUserData(userData);
        } else {
          console.error('Document not found');
          // Handle this case, e.g., display an error message or create a new document
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle error, e.g., show an error message
      }
    };

    fetchUserData();

  }, []);
  
  const [birthdate, setBirthdate] = useState('');

    const [showPicker, setShowPicker] = useState(false);
    const [date, setDate] = useState(new Date());

    const toggleDatePicker = () => {
        setShowPicker(!showPicker);
    };

    const onChange = ({ type }, selectedDate) => {
      if (type === 'set') {
          const currentDate = selectedDate || date;
          setDate(currentDate);
          if (Platform.OS === "android") {
              toggleDatePicker();
              setBirthdate(formatDate(currentDate));
              // Update userData with selected birthdate
              setUserData(prevState => ({ ...prevState, birthdate: formatDate(currentDate) }));
          }
      } else {
          toggleDatePicker();
      }
  };
  
  const confirmIOSDate = () => {
      setBirthdate(formatDate(date));
      toggleDatePicker();
      // Update userData with selected birthdate
      setUserData(prevState => ({ ...prevState, birthdate: formatDate(date) }));
  }

    const formatDate = (rawDate) => {
        const formattedDate = new Date(rawDate);
        const year = formattedDate.getFullYear();
        const month = (formattedDate.getMonth() + 1).toString().padStart(2, '0');
        const day = formattedDate.getDate().toString().padStart(2, '0');

        return `${day}-${month}-${year}`;
    }

  const handleUpdateProfile = async () => {
    try {
      if (!auth.currentUser) {
        console.error('User is not authenticated');
        return;
      }

      const uid = auth.currentUser.uid;

      // Validate fields
      const { firstName, lastName, username, email, phoneNumber, city, birthdate } = userData;

      if (!firstName || !lastName || !username || !email || !phoneNumber || !city || !birthdate) {
        Alert.alert('حقول مفقودة', 'يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('بريد إلكتروني غير صحيح', 'يرجى استخدام بريد إلكتروني صحيح');
        return;
      }

      // Validate phone number format
      if (phoneNumber.length !== 10 || !phoneNumber.startsWith('05')) {
        Alert.alert('رقم هاتف غير صحيح', 'يجب أن يتكون رقم الهاتف من 10 أرقام ويبدأ بـ "05"');
        return;
      }
      

      
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(query(usersRef, where('uid', '==', uid)));
  
      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        const userId = docSnapshot.id; // Get the Firestore-assigned document ID

        console.log('Document ID:', userId); // Log document ID

        
        // Update the Firestore document with the latest user data from the state
        await updateDoc(doc(db, 'users', userId), userData);

        // Log the updated user data
        console.log('User data after update:', userData);

      
      Alert.alert('تم تحديث الملف الشخصي', 'تم تحديث معلوماتك بنجاح.', [
        {
            text: 'OK',
            onPress: () => {
                // Pass the updated first name as a parameter when navigating to SettingsScreen
                navigation.navigate('Settings', { updatedFirstName: userData.firstName });
            },
        },
    ]);
    
    } else {
      console.error('No user document found with the provided UID.');
    }
  } catch (error) {
    console.error('Error updating user data:', error);
    Alert.alert('خطأ', 'حدث خطأ أثناء تحديث الملف الشخصي.');
  }
};

return (
    <View style={{ flex: 1 }}>
    {/* top nav bar */}
    
    <TopNavBar2 />
    
  <ScrollView style={{ flex: 1 }}>

  {/* Your edit profile screen content */}
  <View style={{ flex: 1}}>
    
  <View style={styles.greetingContainer}>
      <Text style={styles.greetingText}>ملفي الشخصي</Text>
      <Text style={styles.descriptionText}> بيانات الملف الشخصي</Text>
  </View>

  <View style={styles.infocontainer}>
      <Text style={styles.label}>الاسم الأول</Text>
      <TextInput
        style={styles.input}
        placeholder={userData.firstName}
        onChangeText={value => {
          console.log('Previous userData:', userData);
          setUserData(prevState => ({ ...prevState, firstName: value }));
          console.log('Updated userData:', userData);
        }}
      />
      <Text style={styles.label}>الاسم الأخير</Text>
      <TextInput
        style={styles.input}
        placeholder={userData.lastName}
        onChangeText={value => setUserData(prevState => ({ ...prevState, lastName: value }))}
      />
      <Text style={styles.label}>اسم المستخدم</Text>
      <TextInput
        style={styles.input}
        placeholder={userData.username}
        onChangeText={value => setUserData(prevState => ({ ...prevState, username: value }))}
      />
      <Text style={styles.label}>البريد الالكتروني</Text>
      <TextInput
        style={styles.input}
        placeholder={userData.email}
        onChangeText={value => setUserData(prevState => ({ ...prevState, email: value }))}
      />

<Text style={styles.label}>رقم الجوال </Text>
      <TextInput
        style={styles.input}
        placeholder={userData.phoneNumber}
        onChangeText={value => setUserData(prevState => ({ ...prevState, phoneNumber: value }))}
      />

<Text style={styles.label}>المدينة  </Text>
      <TextInput
        style={styles.input}
        placeholder={userData.city}
        onChangeText={value => setUserData(prevState => ({ ...prevState, city: value }))}
      />

<Text style={styles.label}>تاريخ الميلاد  </Text>
{showPicker && (
    <DateTimePicker
        mode='date'
        display='spinner'
        value={date}
        onChange={onChange}
        maximumDate={new Date('2009-1-1')}
        minimumDate={new Date('1940-1-1')}
        style={styles.datePicker}
    />
)}

{showPicker && Platform.OS === "ios" && (
    <View style={styles.iosCancelButton}>
        <TouchableOpacity onPress={toggleDatePicker} style={[styles.button, styles.pickerButton, { backgroundColor: 'lightgray' }]}>
            <Text>الغاء</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={confirmIOSDate} style={[styles.button, styles.pickerButton]}>
            <Text>تأكيد</Text>
        </TouchableOpacity>
    </View>
)}

{!showPicker && (
    <TouchableOpacity onPress={toggleDatePicker}>
        <TextInput
            style={styles.input}
            value={birthdate}
            placeholder={userData.birthdate} // Placeholder set to userData.birthdate
            editable={false}
            onPressIn={toggleDatePicker}
        />
    </TouchableOpacity>
)}

      <TouchableOpacity onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>تحديث الملف الشخصي</Text>
      </TouchableOpacity>
    </View>

      
  </View>

  </ScrollView>

    <BottomNavBar/>

  </View>
  );
}

const styles = StyleSheet.create({
  infocontainer: {
    flex: 1,
    paddingHorizontal: 20,

  },
  
  greetingContainer: {
    alignItems: 'flex-end', // Align to the right
    paddingTop: 20,
    paddingHorizontal: 20, // Add horizontal padding
  },
  
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#143638',
    
  },
  
  descriptionText: {
    fontSize: 16,
    color: '#143638', // Adjust color as needed
    marginTop: 20,
  
  },

  label: {
    fontSize: 16,
    marginBottom: 10,
    color: 'black',
        textAlign: 'right',
        marginTop:20,

  },
  input: {
    //hight 40ishh
    paddingVertical: 12,
    color: '#555',
    backgroundColor: '#D3D9D9',
    borderRadius: 8,
    marginBottom: 10,
    textAlign: 'right',
    paddingHorizontal: 20,
  },
  /*button: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    borderRadius: 5,
  },*/
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline', // Underline the text,
    color: '#82C8FF',
    paddingVertical: 35,
  },
  iosCancelButton: {
    flexDirection: 'row',
    justifyContent:'space-around',
},
pickerButton:{
    paddingHorizontal:20,
},
button: {
  padding: 15,
  backgroundColor: themeColors.lightb,
  borderRadius: 20,
  marginTop: 25,
},

});



