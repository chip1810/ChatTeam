import { Button, Card, Title } from 'antd';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid

export default function GameLobby() {
  const navigate = useNavigate();

  const createRoom = () => {
    const newRoomId = uuidv4().substring(0, 8); // Tạo mã phòng ngắn 8 ký tự
    navigate(`/game/${newRoomId}`); // Nhảy vào phòng ngay
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <Card style={{ width: 400, textAlign: 'center', borderRadius: 15 }}>
        <Title level={2}>Sòng Bài Fuwa 🃏</Title>
        <p>Tạo phòng và mời bạn bè cùng sát phạt!</p>
        <Button type="primary" size="large" block onClick={createRoom}>
          Tạo phòng mới
        </Button>
      </Card>
    </div>
  );
}