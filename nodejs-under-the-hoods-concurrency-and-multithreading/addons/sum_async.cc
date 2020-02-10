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

// função de processamento de dados
static void WorkAsync(uv_work_t *req) {
    ThreadData* threadData = static_cast<ThreadData*>(req->data);

    // realiza o processamento dos dados
    int i, j;
    double a = 3.1415926, b = 2.718;
    for (i = 0; i < 1000000000; i++) {
        for (j = 0; j < 10; j++) {
            a += b;
        }
    }

    // insere o resultado na memória compartilhada
    threadData->result = a;
}

// função que será chamada pela LibUV quando a thread
// processadora finalizar seu trabalho
static void WorkAsyncComplete(uv_work_t *req, int status) {
    Isolate* isolate = Isolate::GetCurrent();
    v8::HandleScope handleScope(isolate); // Node 4.x
    
    ThreadData *threadData = static_cast<ThreadData *>(req->data);

    // pegando o resultado
    double result = threadData->result;
    Local<Value> argv[] = { Number::New(isolate, result) };

    // executando o callback passado
    // como parâmetro para o Addon
    Local<Function>::New(
        isolate,
        threadData->callback
    )->Call(
        isolate->GetCurrentContext(), // context
        Null(isolate), // recv
        1, // argc
        argv // argv
    ).ToLocalChecked();

    // libera os dados de callback do struct
    threadData->callback.Reset();

    // por fim, remove o struct do espaço de
    // memória compartilhado pelo threadpool
    delete threadData;
}

void SumAsync(const v8::FunctionCallbackInfo<v8::Value>& args) {
    v8::Isolate* isolate = args.GetIsolate();

    ThreadData* threadData = new ThreadData();
    threadData->request.data = threadData;

    // guarda o callback JS no pacote threadData para 
    // que possamos chamá-lo mais tarde
    Local<Function> callback = Local<Function>::Cast(args[0]);
    threadData->callback.Reset(isolate, callback);

    // incializa uma thread do pool
    uv_queue_work(
        uv_default_loop(),
        &threadData->request,
        WorkAsync,
        WorkAsyncComplete
    );

    // retorna um valor sem erros para o Event Loop
    // enquanto o processamento assíncrono acontece
    args.GetReturnValue().Set(Undefined(isolate));
}

void Initialize(Local<Object> exports) {
    NODE_SET_METHOD(exports, "sum", SumAsync);
}

NODE_MODULE(addon, Initialize)
