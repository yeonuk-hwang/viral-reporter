# 인스타그램 인기게시물 스크래퍼

인스타그램의 특정 해시태그의 인기게시물에 해당 게시물이 포함되어있는지 확인하는 자동화 프로그램

## 실행방법

1. install NPM packages

   ```zsh
   npm install
   ```

2. start development mode

   ```zsh
   npm start
   ```

## Example

1. 로그인

   - 인스타그램 아이디와 비밀번호를 통해서 로그인을 진행합니다.
   - 특정 상황에서 아이디가 비활성화 되는 경우가 있으니, 스크랩용 아이디를 따로 생성하는 것을 권장드립니다.
   - 태그 검색은 로그인 없이도 가능하지만, 인기게시물의 경우 로그인한 사용자에 따라서 달라지는 경향이 있기에, 본 프로그램에서는 로그인을 필수적으로 진행하도록 만들었습니다.
     <img src="https://user-images.githubusercontent.com/54208214/195982154-d340a5a3-55ab-4ace-8344-19998f2b5ccc.png" width=800 />

2. 검색

   - 검색할 해시태그와, 해당 태그의 인기게시물에 포함되어있는지 확인할 포스트 URL을 입력합니다.
     <img src="https://user-images.githubusercontent.com/54208214/195982157-8a75987b-9306-4a58-b3b4-41a170854119.png" width=800 />
     <img src="https://user-images.githubusercontent.com/54208214/200505457-ada513da-97aa-4dba-b989-fb29847e0632.png" width=800 />
   - 입력 시 엑셀등의 스프레드 시트에서 복사 한 후 붙여넣기 기능을 지원합니다.
     <img src="https://user-images.githubusercontent.com/54208214/200504936-530a9f60-4d4f-4b41-a817-2880e2fb9e72.gif" width=800 />


3. 결과 확인
   - 결과를 확인합니다.
   - 등록된 게시물의 경우 자동으로 스크린샷이 다운로드 폴더에 저장되며, 경로 링크를 클릭하면 해당 파일을 확인할 수 있습니다.
   - 파일의 이름은 `[순번]_[키워드].png`로 저장됩니다.
   - 아래의 스크린샷 폴더 열기 버튼을 클릭하면 스크린샷이 저장된 다운로드 폴더가 열립니다.
      <img src="https://user-images.githubusercontent.com/54208214/200502741-ab35a8fd-ca15-4a31-9df2-e06d48633a51.png" width=800 />
      <img src="https://user-images.githubusercontent.com/54208214/200502836-4f1625bf-9b85-45a8-a8de-9a56ce750740.png" width=800 />
      
## TO DO

- [ ] 리드미 내용 추가
- [ ] 모듈간 의존성 리팩토링
- [ ] 빌드 & 릴리즈 설정 확인 및 보일러 플레이트 없이 세팅
- [ ] main process & renderer process 테스트 추가
- [ ] UI 테스트 추가

## License

[MIT](https://choosealicense.com/licenses/mit/)
