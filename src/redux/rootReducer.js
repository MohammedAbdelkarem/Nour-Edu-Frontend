// ** Reducers Imports
import navbar from './navbar'
import layout from './layout'
import auth from './authentication'

// ** RTK Imports
import { authSlice } from './rtkQuery/auth'
import { aboutSlice } from './rtkQuery/statics-pages/about'
import { contactSlice } from './rtkQuery/statics-pages/contact'
import { tosSlice } from './rtkQuery/statics-pages/tos'
import { privacySlice } from './rtkQuery/statics-pages/privacy'
import { faqCategorySlice } from './rtkQuery/statics-pages/category'
import { faqSlice } from './rtkQuery/statics-pages/faq'
import { mediaSlice } from './rtkQuery/media'
import { storySlice } from './rtkQuery/content/story'
import { bannerSlice } from './rtkQuery/content/banner'
import { userSlice } from './rtkQuery/user/users'
import { settingsSlice } from './rtkQuery/settings'
import { adminSlice } from './rtkQuery/admin'
import { notificationSlice } from './rtkQuery/notification'
import { serviceSlice } from './rtkQuery/service'
import { teacherSlice } from './rtkQuery/teacher'
import { elevelSlice } from './rtkQuery/hierarchical/e-level'
import { clevelSlice } from './rtkQuery/hierarchical/c-level'
import { courseSlice } from './rtkQuery/hierarchical/course'
import { subjectSlice } from './rtkQuery/hierarchical/subject'
import { unitSlice } from './rtkQuery/hierarchical/unit'
import { subUnitSlice } from './rtkQuery/hierarchical/sub-units'
import { lessonSlice } from './rtkQuery/hierarchical/lesson'
import { fileSlice } from './rtkQuery/hierarchical/file'
import { questionSlice } from './rtkQuery/question'
import { quizSlice } from './rtkQuery/quiz'
import { transactionSlice } from './rtkQuery/transaction'
import { sellPointSlice } from './rtkQuery/sell-points'
import { versionSlice } from './rtkQuery/version'

const rootReducer = {
  [authSlice.reducerPath]:authSlice.reducer,
  [aboutSlice.reducerPath]:aboutSlice.reducer,
  [contactSlice.reducerPath]:contactSlice.reducer,
  [tosSlice.reducerPath]:tosSlice.reducer,
  [privacySlice.reducerPath]:privacySlice.reducer,
  [faqSlice.reducerPath]:faqSlice.reducer,
  [faqCategorySlice.reducerPath]:faqCategorySlice.reducer,
  [mediaSlice.reducerPath]:mediaSlice.reducer,
  [storySlice.reducerPath]:storySlice.reducer,
  [bannerSlice.reducerPath]:bannerSlice.reducer,
  [userSlice.reducerPath]:userSlice.reducer,
  [settingsSlice.reducerPath]:settingsSlice.reducer,
  [adminSlice.reducerPath]:adminSlice.reducer,
  [notificationSlice.reducerPath]:notificationSlice.reducer,
  [serviceSlice.reducerPath]:serviceSlice.reducer,
  [teacherSlice.reducerPath]:teacherSlice.reducer,
  [elevelSlice.reducerPath]:elevelSlice.reducer,
  [clevelSlice.reducerPath]:clevelSlice.reducer,
  [courseSlice.reducerPath]:courseSlice.reducer,
  [subjectSlice.reducerPath]:subjectSlice.reducer,
  [unitSlice.reducerPath]:unitSlice.reducer,
  [subUnitSlice.reducerPath]:subUnitSlice.reducer,
  [lessonSlice.reducerPath]:lessonSlice.reducer,
  [fileSlice.reducerPath]:fileSlice.reducer,
  [questionSlice.reducerPath]:questionSlice.reducer,
  [quizSlice.reducerPath]:quizSlice.reducer,
  [transactionSlice.reducerPath]:transactionSlice.reducer,
  [sellPointSlice.reducerPath]:sellPointSlice.reducer,
  [versionSlice.reducerPath]:versionSlice.reducer,
  auth,
  navbar,
  layout
}

export default rootReducer