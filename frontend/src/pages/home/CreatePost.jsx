import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState, lazy, Suspense } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Lazy load emoji picker for better perf
const EmojiPicker = lazy(() => import("emoji-picker-react"));

const CreatePost = () => {
    const [text, setText] = useState("");
    const [img, setImg] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const imgRef = useRef(null);
    const textareaRef = useRef(null);
    const queryClient = useQueryClient();
    const { data: authUser } = useQuery({ queryKey: ["authUser"] });

    const {
        mutate: createPost,
        isPending,
        isError,
        error,
    } = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/posts/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, img }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw data.error;
            }
            if (data.error) {
                throw data.error;
            }
            return data;
        },

        onSuccess: () => {
            setText("");
            setImg(null);
            toast.success("Post created successfully");
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },

        onError: () => {
            toast.error("Unable to create post", error);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        createPost();
    };

    const handleImgChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImg(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const insertEmoji = (emojiObject) => {
        const emoji = emojiObject.emoji;
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newText = text.substring(0, start) + emoji + text.substring(end);
        setText(newText);

        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
            textarea.focus();
        }, 0);
    };

    // Close emoji picker on outside click
    const wrapperRef = useRef(null);
    useState(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="flex p-4 items-start gap-4 border-b border-gray-700">
            <div className="avatar">
                <div className="w-8 rounded-full">
                    <img src={authUser?.profileImg || "/avatar-placeholder.png"} />
                </div>
            </div>
            <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
                <textarea
                    ref={textareaRef}
                    className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-800"
                    placeholder="What is happening?!"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                {img && (
                    <div className="relative w-72 mx-auto">
                        <IoCloseSharp
                            className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
                            onClick={() => {
                                setImg(null);
                                imgRef.current.value = null;
                            }}
                        />
                        <img src={img} className="w-full mx-auto h-72 object-contain rounded" />
                    </div>
                )}

                <div
                    className="flex justify-between border-t py-2 border-t-gray-700 relative"
                    ref={wrapperRef}
                >
                    <div className="flex gap-1 items-center relative">
                        <CiImageOn
                            className="fill-primary w-6 h-6 cursor-pointer"
                            onClick={() => imgRef.current.click()}
                        />
                        <div className="relative">
                            <BsEmojiSmileFill
                                className="fill-primary w-5 h-5 cursor-pointer"
                                onClick={() => setShowEmojiPicker((prev) => !prev)}
                            />
                            {showEmojiPicker && (
                                <Suspense fallback={<div>Loading emojis...</div>}>
                                    <div
                                        className="absolute top-full mt-2 left-0 z-50"
                                        style={{ width: 300, height: 350 }}
                                    >
                                        <EmojiPicker
                                            onEmojiClick={insertEmoji}
                                            theme="dark"
                                            height={350}
                                            width={300}
                                        />
                                    </div>
                                </Suspense>
                            )}
                        </div>
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        ref={imgRef}
                        onChange={handleImgChange}
                    />
                    <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                        {isPending ? "Posting..." : "Post"}
                    </button>
                </div>

                {isError && <div className="text-red-500">Something went wrong</div>}
            </form>
        </div>
    );
};

export default CreatePost;
