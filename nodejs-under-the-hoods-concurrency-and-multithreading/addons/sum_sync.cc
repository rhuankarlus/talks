#include <node.h>
#include <v8.h>

using namespace v8;

static void SumSync(const v8::FunctionCallbackInfo<v8::Value>& args) {
    Isolate* isolate = args.GetIsolate();

    int i, j;
    double a = 3.1415926, b = 2.718;
    for (i = 0; i < 1000000000; i++) {
        for (j = 0; j < 10; j++) {
            a += b;
        }
    }

    args.GetReturnValue().Set(Number::New(isolate, a));
}

void Initialize(Local<Object> exports) {
    NODE_SET_METHOD(exports, "sum", SumSync);
}

NODE_MODULE(addon, Initialize)
