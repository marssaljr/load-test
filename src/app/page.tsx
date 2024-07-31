import Form from "./form";

export default function Home() {


    return (
        <main className="bg-zinc-950 gap-4 p-4 flex min-h-screen flex-col items-center w-md min-w-md">
            <div className="w-96 flex flex-col gap-4">
                <h1 className="text-xl font-bold self-center">Load balance test</h1>
                <Form />
            </div>
        </main>
    );
}
