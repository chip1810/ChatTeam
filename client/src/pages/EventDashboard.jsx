import { useEffect, useState, useMemo } from "react";
import { Avatar, Layout, Menu, Button, Typography, Spin, Modal, Form, Input, Switch, DatePicker, Select, message, Row, Col, Space } from "antd";
import { FireOutlined, CheckSquareOutlined, UserOutlined, PlusOutlined, CoffeeOutlined } from "@ant-design/icons";
import eventService from "../services/eventService";
import EventCard from "../components/EventCard";
import conversationService from "../services/conversationService";// Import component vừa tách

const { Sider, Content } = Layout;
const { Title } = Typography;

export default function EventDashboard({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterKey, setFilterKey] = useState("all"); // State lọc: all, joined, my_events

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [searchValue, setSearchValue] = useState(""); // Thêm state này


  const myId = user._id || user.id;
  const handleCreateEvent = async (values) => {
    try {
      const payload = {
        ...values,
        invitedUserIds: values.invitedUserIds || [],
        eventDate: values.eventDate?.toISOString()
      };
      const res = await eventService.createEvent(payload);
      message.success("Tạo sự kiện thành công!");
      setEvents([res.data, ...events]); // Thêm vào đầu danh sách
      setIsModalOpen(false);
      form.resetFields();
    } catch {
      message.error("Lỗi khi tạo sự kiện");
    }
  };

  const handleSearchUsers = async (value) => {
    setSearchValue(value); // Luôn giữ text trong ô input

    if (!value || value.trim() === "") {
      setUsers([]);
      return;
    }

    setFetchingUsers(true);
    try {
      const res = await conversationService.getChatUsers(value);
      setUsers(res.data);
    } catch (err) {
      console.error("Lỗi tìm user:", err);
    } finally {
      setFetchingUsers(false);
    }
  };

  const filteredAndSortedEvents = useMemo(() => {
    // 1. Loại bỏ các phần tử lỗi (null/undefined) trước khi xử lý
    let result = events.filter(ev => ev !== null && ev !== undefined);

    // 2. Lọc theo Sidebar (Tab)
    switch (filterKey) {
      case "joined":
        result = result.filter(ev =>
          ev.invitedUsers?.some(inv => (inv.user?._id || inv.user) === myId && inv.status === "joined")
        );
        break;
      case "my_events":
        result = result.filter(ev => (ev.admin?._id || ev.admin) === myId);
        break;
    }

    // 3. Lọc theo Trạng thái (Dropdown)
    if (statusFilter !== "all") {
      result = result.filter(ev => {
        const myInv = ev.invitedUsers?.find(inv => {
          const invId = inv.user?._id || inv.user;
          return invId?.toString() === myId?.toString();
        });
        return myInv?.status === statusFilter;
      });
    }

    // 4. Sắp xếp (Thêm kiểm tra an toàn createdAt)
    result.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [events, filterKey, myId, sortBy, statusFilter]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await eventService.getEvents();
      setEvents(res.data);
    } catch {
      message.error("Không thể tải danh sách sự kiện");
    } finally {
      setLoading(false);
    }
  };



  const handleUpdateStatus = async (eventId, status) => {
    try {
      const res = await eventService.updateStatus(eventId, status);
      message.success("Cập nhật thành công!");

      // Dùng dữ liệu mới nhất từ server trả về để thay thế event cũ trong list
      setEvents(prev => prev.map(ev =>
        ev._id === eventId ? res.data : ev
      ));
    } catch {
      message.error("Lỗi cập nhật");
    }
  };
  return (
    <Layout style={{ minHeight: "100vh", background: "#fff" }}>
      {/* SIDEBAR BÊN TRÁI */}
      <Sider width={250} theme="light" style={{ borderRight: '1px solid #f0f0f0', paddingTop: 24 }}>
        <div style={{ padding: '0 16px 24px' }}>
          <Button
            type="primary"
            block
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setIsModalOpen(true)}
            style={{ borderRadius: 8 }}
          >
            Tạo sự kiện mới
          </Button>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[filterKey]}
          onClick={({ key }) => setFilterKey(key)}
          items={[
            { key: 'all', icon: <FireOutlined />, label: 'Tất cả sự kiện' },
            { key: 'joined', icon: <CheckSquareOutlined />, label: 'Đã tham gia' },
            { key: 'my_events', icon: <UserOutlined />, label: 'Sự kiện của tôi' },
          ]}
        />
      </Sider>

      {/* NỘI DUNG CHÍNH */}
      <Content style={{ padding: '24px 40px', overflowY: 'auto' }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              {filterKey === 'all' && "Khám phá sự kiện"}
              {filterKey === 'joined' && "Sự kiện bạn tham gia"}
            </Title>
          </Col>
          <Col>
            <Space>
              {/* Dropdown Sắp xếp */}
              <Select value={sortBy} onChange={setSortBy} style={{ width: 160 }}>
                <Select.Option value="newest">Mới nhất trước</Select.Option>
                <Select.Option value="oldest">Cũ nhất trước</Select.Option>
              </Select>

              {/* Dropdown Trạng thái (Chỉ hiện khi ở Tab Tất cả hoặc Tham gia) */}
              {filterKey !== "my_events" && (
                <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }}>
                  <Select.Option value="all">Tất cả trạng thái</Select.Option>
                  <Select.Option value="pending">Chưa xem</Select.Option>
                  <Select.Option value="viewed">Đang cân nhắc</Select.Option>
                  <Select.Option value="joined">Đã xác nhận</Select.Option>
                  <Select.Option value="declined">Đã từ chối</Select.Option>
                </Select>
              )}
            </Space>
          </Col>
        </Row>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1000, margin: '0 auto' }}>
            {filteredAndSortedEvents.map(event => (
              <EventCard
                key={event._id}
                event={event}
                userId={myId}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
            {filteredAndSortedEvents.length === 0 && (
              <div style={{ textAlign: 'center', gridColumn: '1/-1', marginTop: 40 }}>
                <CoffeeOutlined style={{ fontSize: 40, color: '#ccc' }} />
                <p style={{ color: '#999', marginTop: 8 }}>Không tìm thấy sự kiện nào.</p>
              </div>
            )}
          </div>
        )}
      </Content>


      {/* MODAL TẠO SỰ KIỆN */}
      <Modal
        title="Tạo bài viết / Sự kiện mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Đăng bài"
      >
        <Form form={form} layout="vertical" onFinish={handleCreateEvent} initialValues={{ isPublic: true }}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
            <Input placeholder="Nhập tên sự kiện..." />
          </Form.Item>

          <Form.Item name="description" label="Nội dung/Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn gọn về sự kiện..." />
          </Form.Item>

          <Form.Item name="isPublic" label="Chế độ công khai" valuePropName="checked">
            <Switch checkedChildren="Tất cả" unCheckedChildren="Chỉ người được mời" />
          </Form.Item>

          <Form.Item name="invitedUserIds" label="Mời bạn bè (không bắt buộc)">
            <Select
              mode="multiple"
              showSearch
              placeholder="Gõ tên để tìm người mời..."
              filterOption={false}
              searchValue={searchValue} // Kiểm soát text đang gõ
              onSearch={handleSearchUsers} // Chỉ dùng 1 hàm duy nhất xử lý cả set value và gọi API
              onChange={() => {
                // Khi chọn xong, Antd mặc định xóa searchValue, ta cần xóa thủ công để đồng bộ
                setSearchValue("");
              }}
              optionLabelProp="label"
              style={{ width: '100%' }}
              notFoundContent={fetchingUsers ? <Spin size="small" /> : "Không tìm thấy kết quả"}
            >
              {users.map((u) => (
                <Select.Option key={u._id} value={u._id} label={u.username}>
                  <Space>
                    <Avatar size="small" src={u.avatar} />
                    {u.username}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="eventDate" label="Ngày diễn ra">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}