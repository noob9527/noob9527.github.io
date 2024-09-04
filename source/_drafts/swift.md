self documented?
@escape?

case 1
```swift
let arr1 = [1,2,3]
var arr2 = [1,2,3]
arr1.append(4)
arr2.append(4)
```

case 2 ???
```swift
struct Foo1 {
    func mutate() {

    }
    func immutate() {

    }
}

class Foo2 {
    func mutate() {

    }
    func immutate() {

    }
}

class Bar {
    private(set) var foo1: Foo1
    private(set) var foo2: Foo2
}
```

case 3, swift requires argument order even when paremeter names are provided
see: https://stackoverflow.com/questions/58346262/why-does-swift-require-parameter-names-if-it-also-requires-argument-order


case 4, you cant write extension for non-nominal types
see: https://stackoverflow.com/a/44396546
which means, you can't create extension for "Any" type


case 5, too many conventional names?
```swift
@propertyWrapper
struct SampleWrapper {
    var value = 0

    // here we have conventional name "wrappedValue"
    var wrappedValue: Int {
        get {
            return value
        }
        set {
            // here we have conventional name "newValue"
            value = -newValue
        }
    }
}

struct SampleWrapperContainer {
    @SampleWrapper var height: Int
    @SampleWrapper var width: Int

    var heightWrapper: SampleWrapper {
        get {
            // here we have conventional rule
            // that is, we use underscore + property name
            // to access the property wrapper
            return _height
        }
        set {
            // here we have conventional rule
            // that is, we use underscore + property name
            // to access the property wrapper
            _height.wrappedValue = newValue
        }
    }
}
```
