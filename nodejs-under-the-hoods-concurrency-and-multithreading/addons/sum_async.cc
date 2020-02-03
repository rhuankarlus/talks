#include <node.h>
#include <v8.h>
#include <uv.h>
#include <iostream>
#include <thread>

using namespace std;
using namespace v8;

struct ThreadData {
    uv_work_t  request;
    Persistent<Function> callback;
    double result;
};

static void WorkAsync(uv_work_t *req) {
    ThreadData* threadData = static_cast<ThreadData*>(req->data);

    int i, j;
    double a = 3.1415926, b = 2.718;
    for (i = 0; i < 1000000000; i++) {
        for (j = 0; j < 10; j++) {
            a += b;
        }
    }

    threadData->result = a;
}

// called by libuv in event loop when async function completes
static void WorkAsyncComplete(uv_work_t *req, int status) {
    Isolate* isolate = Isolate::GetCurrent();
    v8::HandleScope handleScope(isolate); // Required for Node 4.x
    
    ThreadData *threadData = static_cast<ThreadData *>(req->data);

    // set up return arguments
    double result = threadData->result;
    Local<Value> argv[] = { Number::New(isolate, result) };

    // execute the callback
    Local<Function>::New(
        isolate,
        threadData->callback
    )->Call(
        isolate->GetCurrentContext(), // context
        Null(isolate), // recv
        1, // argc
        argv // argv
    ).ToLocalChecked();

    // Free up the persistent function callback
    threadData->callback.Reset();

    delete threadData;
}

void SumAsync(const v8::FunctionCallbackInfo<v8::Value>& args) {
    v8::Isolate* isolate = args.GetIsolate();

    ThreadData* threadData = new ThreadData();
    threadData->request.data = threadData;

    // store the callback from JS in the threadData package so we can 
    // invoke it later
    Local<Function> callback = Local<Function>::Cast(args[0]);
    threadData->callback.Reset(isolate, callback);

    // kick of the worker thread
    uv_queue_work(
        uv_default_loop(),
        &threadData->request,
        WorkAsync,
        WorkAsyncComplete
    );

    args.GetReturnValue().Set(Undefined(isolate));
}

void Initialize(Local<Object> exports) {
    NODE_SET_METHOD(exports, "sum", SumAsync);
}

NODE_MODULE(addon, Initialize)
