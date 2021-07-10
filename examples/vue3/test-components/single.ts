import { defineComponent, createApp, h } from 'vue3'

import {
  userType,
  messageType,
  ageType,
  arrayOfStringsType,
  arrayOfMultipleType,
  scoreType,
  funcType,
  anyType,
  objectOfTuple,
  oneOfTuple,
} from '../../shared/validators'

const UserComponent = defineComponent({
  props: {
    user: userType,
    message: messageType,
    age: ageType,
    hobbies: arrayOfStringsType,
    randomData: arrayOfMultipleType,
    score: scoreType,
  },
})

const UserProfile = defineComponent({
  props: {
    onClick: funcType,
    action: anyType,
    tupleObj: objectOfTuple,
    oneOf: oneOfTuple,
  },
})

createApp({
  render: () => h(UserComponent),
})
