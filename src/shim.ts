/* eslint-disable @typescript-eslint/no-unused-vars */
import { isPlainObject } from 'is-plain-object'
import { typeDefaults } from './sensibles'
import { config } from './config'
import { VueTypesDefaults } from './types'
export { VueTypeDef, VueTypeValidableDef } from './types'
const dfn = Object.defineProperty

const isArray =
  Array.isArray ||
  function (value) {
    return Object.prototype.toString.call(value) === '[object Array]'
  }

function type(name: string, props: any = {}, validable = false): any {
  const descriptors: PropertyDescriptorMap = {
    _vueTypes_name: {
      value: name,
      writable: true,
    },
    def: {
      value(v) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const t = this
        if (v === undefined) {
          if ('default' in this) {
            delete this.default
          }
          return this
        }
        if (isArray(v)) {
          t.default = () => [].concat(v)
        } else if (isPlainObject(v)) {
          t.default = () => Object.assign({}, v)
        } else {
          t.default = v
        }
        return t
      },
    },
    isRequired: {
      get() {
        this.required = true
        return this
      },
    },
  }

  if (validable) {
    ;(descriptors as any).validate = {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      value() {},
    }
  }
  if (!props.validator) {
    props.validator = () => true
  }

  return Object.defineProperties(props, descriptors)
}

export { config }

export const any = <T = any>() => type('any', {}, true)
export const func = <T = any>() => type('func', { type: Function }, true)
export const bool = () => type('bool', { type: Boolean }, true)
export const string = <T = any>() => type('string', { type: String }, true)
export const number = <T = any>() => type('number', { type: Number }, true)
export const array = <T = any>() => type('array', { type: Array }, true)
export const object = <T = any>() => type('object', { type: Object }, true)
export const symbol = () => type('symbol')
export const integer = <T = any>() => type('integer', { type: Number })
export const oneOf = <T = any>(a: any) => type('oneOf')
export const custom = <T = any>(a: any) => type('custom')
export const instanceOf = <T = any>(Constr: any) =>
  type('instanceOf', { type: Constr })
export const oneOfType = <T = any>(a: any) => type('oneOfType')
export const arrayOf = <T = any>(a: any) => type('arrayOf', { type: Array })

export const objectOf = <T = any>(a: any) => type('objectOf', { type: Object })
export const shape = <T = any>(a: any) =>
  dfn(type('shape', { type: Object }), 'loose', {
    get() {
      return this
    },
  })
/* eslint-enable @typescript-eslint/no-unused-vars */

function createValidator(
  root: any,
  name: string,
  props: any,
  getter = false,
  validable = false,
) {
  const prop = getter ? 'get' : 'value'
  const descr = {
    [prop]: () =>
      type(name, props, validable).def(
        getter ? root.defaults[name] : undefined,
      ),
  }

  return dfn(root, name, descr)
}

export function fromType(name: string, source: any, props: any = {}) {
  return type(
    name,
    {
      ...source,
      ...props,
      validator: null,
    },
    !!source.validable,
  )
}

export const toValidableType = <T>(name: string, props: any) =>
  type(name, props, true)
export const toType = <T>(name: string, props: any) => type(name, props)

const BaseVueTypes = /*#__PURE__*/ (() =>
  class BaseVueTypes {
    static defaults: Partial<VueTypesDefaults> = {}

    static sensibleDefaults: Partial<VueTypesDefaults> | boolean

    static config = config

    static get any() {
      return any()
    }
    static get func() {
      return func().def(this.defaults.func)
    }
    static get bool() {
      return bool().def(this.defaults.bool)
    }
    static get string() {
      return string().def(this.defaults.string)
    }
    static get number() {
      return number().def(this.defaults.number)
    }
    static get array() {
      return array().def(this.defaults.array)
    }
    static get object() {
      return object().def(this.defaults.object)
    }
    static get symbol() {
      return symbol()
    }
    static get integer() {
      return integer().def(this.defaults.integer)
    }
    static oneOf = oneOf
    static custom = custom
    static instanceOf = instanceOf
    static oneOfType = oneOfType
    static arrayOf = arrayOf
    static objectOf = objectOf
    static shape = shape
    static extend<T = any>(props): T {
      const { name, validate, getter = false, type = null } = props
      // If we are inheriting from a custom type, let's ignore the type property
      const extType = isPlainObject(type) && type.type ? null : type
      return createValidator(this, name, { type: extType }, getter, !!validate)
    }
    static utils = {
      toType: type as (...args: any[]) => any,
      validate: (...args: any[]) => !!args,
    }
  })()

export function createTypes(defs: Partial<VueTypesDefaults> = typeDefaults()) {
  return class extends BaseVueTypes {
    static defaults = { ...defs }

    static get sensibleDefaults() {
      return { ...this.defaults }
    }

    static set sensibleDefaults(v: boolean | Partial<VueTypesDefaults>) {
      if (v === false) {
        this.defaults = {}
        return
      }
      if (v === true) {
        this.defaults = { ...defs }
        return
      }
      this.defaults = { ...v }
    }
  }
}

/* eslint-disable no-console */
if (process.env.NODE_ENV !== 'production') {
  config.silent === false &&
    console.warn(
      'You are using the production shimmed version of VueTypes in a development build. Refer to https://dwightjack.github.io/vue-types/guide/installation.html#production-build to learn how to configure VueTypes for usage in multiple environments.',
    )
}
/* eslint-enable no-console */

export default class VueTypes /*#__PURE__*/ extends createTypes() {}
