/**
 * Text Component
 * uikitten Text 상속
 * 기본 속성 
 *  label 
 * editable : true 일반 텍스트로 만 사용할 경우.(텍스트 포커스 없고 터치하면 반응한다.)
 *  >> disabled : true
 *  >> fontColor: 'black'
 */
 import * as React from 'react'
 import { StyleSheet } from 'react-native';
 import { InputProps, Input } from '@ui-kitten/components';
 
 export interface Props extends InputProps {
     phone?: string, // L , C: 휴대폰 
     textInputRef?: any,
     children?: any,
     bind?: any,
     onChangeValue?: (text: string) => void;
 }
 
 const TextField: React.FC<Props> = (props) => {
     const [value, setValue] = React.useState<string | undefined >(undefined);
     const { style, editable, disabled, bind, onChangeValue, textInputRef, phone, textStyle } = props;
     let _textStyle = textStyle||{}
     const styles = StyleSheet.create({
         container: {
             marginBottom: 10
         }
     });
     const setParams = (value: string) => {
         if (bind) {
             
         }
         if (phone && phone == 'C') {
             value = phoneFormat(value)
         }
         if (textInputRef) {
             textInputRef.current.value = value;
         }
         setValue(value);
         if (onChangeValue) {
             onChangeValue(value)
         }
     }
 
     React.useEffect(() => {
         if (props?.value) {
             setParams(props.value)
         }
         if (bind) {
         }
     }, [props?.value]);
     const phoneFormat = (text) => {
         // var cleaned = ('' + text).replace(/\D/g, '')
         // var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
         // // var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
         // if (match) {
         //     var intlCode = (match[1] ? '+1 ' : ''),
         //         number = [intlCode, '', match[2], '-', match[3], '-', match[4]].join('');
         //     return number;
         // }
         // console.log(text.length)
         // return text;
 
         // if (text.length === 3) {
         //     text = text.replace(/(\d{3})/, '$1-');
         // }
 
         if (text.length === 10) {
             text = text.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
         }
         if (text.length === 13) {
             text = text.replace(/-/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
         }
         return text;
     }
     if (editable === false) {
         _textStyle['color'] = null;
     }
 
     return (
         <Input
             ref={textInputRef}
             {...props}
             value={value}
             onChangeText={setParams}
             style={[styles.container, style]}
             textStyle={_textStyle}
             disabled={disabled ? disabled : false}
         />
     )
 }
 export default TextField;
 
 