import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import MarkdownEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import Spinner from './Spinner';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ReactSortable } from 'react-sortablejs';
import { MdDeleteForever } from "react-icons/md";


export default function Project(
    {
        _id,
        title: existingTitle,
        slug: existingSlug,
        description: existingDescription,
        client: existingClient,
        projectcategory: existingProjectCategory,
        tags: existingTags,
        livepreview: existinglivepreview,
        images: existingImages,
        status: existingStatus,

    }
) {

    const [redirect, setRedirect] = useState(false);

    const router = useRouter()


    const [content, setContent] = useState('');
    const [title, setTitle] = useState(existingTitle || '');
    const [slug, setSlug] = useState(existingSlug || '');
    const [description, setdescription] = useState(existingDescription || '');
    const [client, setClient] = useState(existingClient || []);
    const [projectcategory, setprojectcategory] = useState(existingProjectCategory || []);
    const [tags, settags] = useState(existingTags || []);
    const [livepreview, setlivepreview] = useState(existinglivepreview || []);
    const [images, setImages] = useState(existingImages || []);
    const [status, setstatus] = useState(existingStatus || '');

    // for image uploading 
    const [isUploading, setIsUploading] = useState(false);
    const uploadImageQueue = [];



    async function createBlog(ev) {
        ev.preventDefault();

        if (isUploading) {
            await Promise.all(uploadImageQueue)
        }

        const data = { title, slug, images, description, client, livepreview, projectcategory: '', tags, status };

        try {
            if (_id) {
                await axios.put('http://localhost:3000/api/projects', { ...data, _id });
                toast.success('Data Updated');

            } else {
                console.log('Data being sent for new blog:', data); // Log the data being sent
                await axios.post('http://localhost:3000/api/projects', data);
                toast.success('project Created');

            }
            router.push('/projects')

            setRedirect(true);
        } catch (error) {
            console.error('Error creating/updating projects:', error); // Log the error
            toast.error('Failed to create/update projects'); // Notify user of failure
        }
    };

    async function uploadImages(ev) {
        const files = ev.target?.files
        if (files.length > 0) {
            setIsUploading(true);

            for (const file of files) {
                const data = new FormData();
                data.append('file', file);

                uploadImageQueue.push(
                    axios.post('/api/upload', data).then(res => {
                        setImages(oldImages => [...oldImages, ...res.data.links])
                    })
                )
            }

            // wait for all images to finish uploading

            await Promise.all(uploadImageQueue);


            setIsUploading(false);
            toast.success('images Uploaded')
        } else {
            toast.error('An error Occured!')
        }
    }

    if (redirect) {
        router.push('/projects');
        return null;
    }


    function updateImagesOrder(images) {
        setImages(images)
    }

    function handleDeleteImage(index) {
        const updatedImages = [...images];
        updatedImages.splice(index, 1);
        setImages(updatedImages);
        toast.success('images deleted successfully');
    }


    const handleSlugChange = (e) => {
        const inputValue = e.target.value;
        const newSlug = inputValue.replace(/\s+/g, '-')

        setSlug(newSlug);


    };

    return (
        <>
            <form className='addWebsiteform' onSubmit={createBlog}>
                {/* blog title */}
                <div className='w-100 flex flex-col flex-left mb-2'>
                    <label htmlFor='title'>Title</label>
                    <input
                        type='text'
                        id='title'
                        placeholder='Enter Small title'
                        value={title}
                        onChange={ev => setTitle(ev.target.value)}
                    />
                </div>

                {/* blog slug url */}
                <div className='w-100 flex flex-col flex-left mb-2'>
                    <label htmlFor='slug'>Slug (SEO Friendly URL)</label>
                    <input
                        type='text'
                        id='slug'
                        placeholder='Enter Slug URL'
                        value={slug}
                        onChange={handleSlugChange}
                    />
                </div>

                {/* project client url */}
                <div className='w-100 flex flex-col flex-left mb-2'>
                    <label htmlFor='client'>Client Name</label>
                    <input
                        type='text'
                        id='client'
                        placeholder='Enter Slug URL'
                        value={client}
                        onChange={ev => setClient(ev.target.value)}
                    />
                </div>

                {/* project livepreview url */}
                <div className='w-100 flex flex-col flex-left mb-2'>
                    <label htmlFor='livepreview'>Live-Preview</label>
                    <input
                        type='text'
                        id='livepreview'
                        placeholder='Enter livepreview URL'
                        value={livepreview}
                        onChange={ev => setlivepreview(ev.target.value)}
                    />
                </div>

                {/* blog category */}
                <div className='w-100 flex flex-col flex-left mb-2'>
                    <label htmlFor='category'>Select Category (For Multiple Select ctrl + mouse left key)</label>
                    <select
                        name='category'
                        id='category'
                        multiple
                        onChange={(e) => setprojectcategory(Array.from(e.target.selectedOptions, Option => Option.value))}
                        value={projectcategory}
                    >
                        <option value=''>Select Category</option>
                        <option value='Website Development'>website Development</option>
                        <option value='App Development'>App Development</option>
                        <option value='Design System'>Design System</option>
                        <option value='App Development'>App Development</option>
                        <option value='Website Migration'>Website Migration</option>
                        <option value='E-commerce Site'>E-commerce Site</option>
                        <option value='Performance Evalution'>Performance Evalution</option>

                    </select>
                </div>

                {/* blog images */}
                <div className='w-100 flex flex-col flex-left mb-2'>
                    <div className='w-100'>
                        <label htmlFor='fileInput'>Images (First Image is shown as Thumbnail, you can drag)</label>
                        <input
                            type='file'
                            id='fileInput'
                            className='mt-1'
                            accept='image/*'
                            multiple
                            onChange={uploadImages}
                        />
                    </div>
                    <div className='w-100 flex flex-left mt-1'>
                        {isUploading && (<Spinner />)}
                    </div>
                </div>

                {/* image preview and image sortable with delete image */}

                {!isUploading && (
                    <div className='flex'>
                        <ReactSortable list={Array.isArray(images) ? images : []} setList={updateImagesOrder} animation={200}
                            className='flex gap-1' >

                            {images?.map((link, index) => (
                                <div key={link} className='uploadedimg'>
                                    <img src={link} alt='image' className='object-cover' />
                                    <div className='deleteimg'>
                                        <button onClick={() => handleDeleteImage(index)}><MdDeleteForever /></button>
                                    </div>
                                </div>
                            ))}


                        </ReactSortable>
                    </div>
                )}



                {/* markdown Description */}
                <div className='description w-100 flex flex-col flex-left mb-2'>
                    <label htmlFor='description'>Blogs Content (for Image: first upload and copy link and paste in ![alt text](link))</label>
                    <MarkdownEditor
                        value={description}
                        onChange={(ev) => setdescription(ev.text)}

                        style={{ width: '100%', height: '400px' }}

                        renderHTML={(text) => (
                            <ReactMarkdown components={{
                                code: ({ node, inline, className, children, ...props }) => {
                                    const match = /language-(\w+)/.exec(className || '');

                                    if (inline) {
                                        return <code {...props}>{children}</code>;
                                    } else if (match) {
                                        return (
                                            <div style={{ position: 'relative' }}>
                                                <pre style={{ padding: '0', borderRadius: '5px', overflowX: 'auto', whiteSpace: 'pre-wrap' }} {...props}>
                                                    <code>{children}</code>
                                                </pre>
                                                <button style={{ position: 'absolute', top: '0', right: '0', zIndex: '1' }} onClick={() => navigator.clipboard.writeText(children)}>
                                                    Copy code
                                                </button>
                                            </div>
                                        );
                                    }
                                    return <code {...props}>{children}</code>;
                                }
                            }}>
                                {text}
                            </ReactMarkdown>
                        )}
                    />
                </div>
                {/* tags */}
                <div className='w-100 flex flex-col flex-left mb-2'>
                    <label htmlFor='tags'>Tags</label>
                    <select
                        onChange={(e) => settags(Array.from(e.target.selectedOptions, Option => Option.value))}
                        value={tags}
                        name='tags'
                        id='tags'
                        multiple>
                        <option value='Node Js'>Node Js</option>
                        <option value='React Js'>React Js</option>
                        <option value='Database'>Database</option>
                        <option value='Kubernetes'>Kubernetes</option>
                        <option value='Next Js'>Next Js</option>
                        <option value='Full Stack'>Full Stack</option>
                        <option value='Backend'>Backend</option>
                        <option value='Frontend'>Frontend</option>
                    </select>
                </div>

                {/* blog status */}
                <div className='description w-100 flex flex-col flex-left mb-2'>
                    <label htmlFor='status'>Status</label>
                    <select onChange={(ev) => setstatus(ev.target.value)}
                        value={status}
                        // <select   onChange={(ev) => setstatus(Array.from(ev.target.selectedOptions, Option => Option.value))} 
                        //     value={status}
                        name='status' id='status'>
                        <option value=''>No Select</option>
                        <option value='draft'>Draft</option>
                        <option value='publish'>Publish</option>

                    </select>
                </div>

                <div className='w-100 mb-1'>
                    <button type='submit' className='w-100 addwebbtn flex-center'>SAVE PROJECT</button>
                </div>
            </form>
        </>
    );
}