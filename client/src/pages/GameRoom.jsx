// import { useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { Modal, Select, Avatar, Space, Button, Spin, message } from 'antd';
// import { PlusOutlined } from '@ant-design/icons';
// import conversationService from '../services/conversationService'; // Đảm bảo đúng đường dẫn

// export default function GameRoom({ user }) {
//     const { roomId } = useParams();
//     const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
//     const [players, setPlayers] = useState([user]);
    
//     const [searchValue, setSearchValue] = useState("");
//     const [users, setUsers] = useState([]);
//     const [fetchingUsers, setFetchingUsers] = useState(false);

//     // --- HÀM SEARCH PHẢI NẰM Ở ĐÂY ---
//     const handleSearchUsers = async (value) => {
//         setSearchValue(value);

//         if (!value || value.trim() === "") {
//             setUsers([]);
//             return;
//         }

//         setFetchingUsers(true);
//         try {
//             const res = await conversationService.getChatUsers(value);
//             setUsers(res.data);
//         } catch (err) {
//             console.error("Lỗi tìm user:", err);
//         } finally {
//             setFetchingUsers(false);
//         }
//     };

//     const handleInvite = async (friendId) => {
//         try {
//             // Sau này ông sẽ gọi API gửi tin nhắn mời ở đây
//             console.log(`Đã mời user ${friendId} vào phòng ${roomId}`);
//             message.success("Đã gửi lời mời vào Chat!");
//             setIsInviteModalOpen(false);
//             setSearchValue(""); // Reset ô search
//         } catch  {
//             message.error("Không thể mời bạn bè");
//         }
//     };

//     return (
//         <div style={{ padding: 20, textAlign: 'center' }}>
//             <h2>Phòng chơi bài: <span style={{ color: '#1677ff' }}>{roomId}</span></h2>
            
//             <div style={{ margin: '40px 0', display: 'flex', justifyContent: 'center', gap: 20 }}>
//                 {players.map(p => (
//                     <div key={p?._id} style={{ textAlign: 'center' }}>
//                         <Avatar 
//                             key={p?._id} 
//                             src={p?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p?.username}`} 
//                             size={80} 
//                             style={{ border: '3px solid #fadb14', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} 
//                         />
//                         <div style={{ marginTop: 8, fontWeight: 'bold' }}>{p?.username}</div>
//                     </div>
//                 ))}

//                 {/* Nút cộng để mở Modal mời */}
//                 {players.length < 4 && (
//                     <Button 
//                         shape="circle" 
//                         icon={<PlusOutlined />} 
//                         onClick={() => setIsInviteModalOpen(true)} 
//                         style={{ width: 80, height: 80, borderStyle: 'dashed' }}
//                     />
//                 )}
//             </div>

//             <Button type="primary" size="large" disabled={players.length < 2}>
//                 Bắt đầu ván bài
//             </Button>

//             {/* MODAL MỜI BẠN */}
//             <Modal 
//                 title="Mời bạn bè chiến bài" 
//                 open={isInviteModalOpen} 
//                 onCancel={() => setIsInviteModalOpen(false)}
//                 footer={null}
//             >
//                 <Select
//                     showSearch
//                     placeholder="Gõ tên bạn bè để mời..."
//                     filterOption={false}
//                     onSearch={handleSearchUsers}
//                     searchValue={searchValue}
//                     style={{ width: '100%' }}
//                     onSelect={handleInvite}
//                     notFoundContent={fetchingUsers ? <Spin size="small" /> : null}
//                     optionLabelProp="label"
//                 >
//                     {users.map(u => (
//                         <Select.Option key={u._id} value={u._id} label={u.username}>
//                             <Space>
//                                 <Avatar size="small" src={u.avatar} />
//                                 {u.username}
//                             </Space>
//                         </Select.Option>
//                     ))}
//                 </Select>
//             </Modal>
//         </div>
//     );
// }