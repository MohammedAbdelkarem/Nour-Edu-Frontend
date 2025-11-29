// ** Redux Imports
import rootReducer from './rootReducer'
import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from './rtkQuery/auth'
import { aboutSlice } from './rtkQuery/statics-pages/about'
import { contactSlice } from './rtkQuery/statics-pages/contact'
import { privacySlice } from './rtkQuery/statics-pages/privacy'
import { tosSlice } from './rtkQuery/statics-pages/tos'
import { faqSlice } from './rtkQuery/statics-pages/faq'
import { faqCategorySlice } from './rtkQuery/statics-pages/category'
import { mediaSlice } from './rtkQuery/media'
import { storySlice } from './rtkQuery/content/story'
import { bannerSlice } from './rtkQuery/content/banner'
import { logSlice } from './rtkQuery/user/logs'
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
  
const store = configureStore({
  reducer: rootReducer,
  middleware:(getDefaultMiddleware) => getDefaultMiddleware().concat(
        authSlice.middleware,
        adminSlice.middleware,
        aboutSlice.middleware,
        contactSlice.middleware,
        tosSlice.middleware,
        privacySlice.middleware,
        faqSlice.middleware,
        faqCategorySlice.middleware,
        mediaSlice.middleware,
        storySlice.middleware,
        bannerSlice.middleware,
        logSlice.middleware,
        userSlice.middleware,
        settingsSlice.middleware,
        notificationSlice.middleware,
        serviceSlice.middleware,
        teacherSlice.middleware,
        elevelSlice.middleware,
        clevelSlice.middleware,
        courseSlice.middleware,
        subjectSlice.middleware,
        unitSlice.middleware,
        subUnitSlice.middleware,
        lessonSlice.middleware,
        fileSlice.middleware,
        questionSlice.middleware,
        quizSlice.middleware,
        transactionSlice.middleware,
        sellPointSlice.middleware,
        versionSlice.middleware
    )
  })

export { store }
