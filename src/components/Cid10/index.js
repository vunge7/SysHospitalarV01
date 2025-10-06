import React, { useState, useEffect } from 'react';
import { UserOutlined, CloseSquareOutlined } from '@ant-design/icons';
import { AutoComplete, Flex, Input, List, Avatar, Button } from 'antd';
import * as XLSX from 'xlsx';
import axios from 'axios';

const renderItem = (title, description) => ({
    value: title,
    label: (
        <Flex align="center" justify="space-between">
            {title}
            <span>{description}</span>
        </Flex>
    ),
});

const Cid10 = (props) => {
    const [options, setOptions] = useState([]);
   // const [data, setData] = useState([]);
    const [dataSource, setDataSource] = useState([]); // Novo estado para os dados do Excel

    useEffect(() => {
        // Lê o arquivo Excel automaticamente ao montar o componente
        axios
        .get(process.env.PUBLIC_URL + '/cids.xlsx', { responseType: 'arraybuffer' })
        .then((res) => {
            const workbook = XLSX.read(res.data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: ['title', 'description'],
                range: 1,
            });
            setDataSource(jsonData);
        });
    }, []);

    const handleSearch = (value) => {
        if (!value) {
            setOptions([]);
            return;
        }
        const filtered = dataSource
            .filter((item) =>
                item.title.toLowerCase().includes(value.toLowerCase()) ||
                item.description.toLowerCase().includes(value.toLowerCase())
            )
            .map((item) => renderItem(item.title, item.description));
        setOptions(filtered);
    };

    const handleSelect = (value) => {
        if (props.data.some((item) => item.title === value)) {
            return;
        }
        const descriptionFiltered = dataSource.filter(
            (item) => item.title === value
        )[0]?.description;

        let dataTemp = props.data;
        dataTemp.push({
            title: value,
            description: descriptionFiltered,
        });

        props.setData([...dataTemp]);
    };

    const handleRemove = (index) => {
        const newData = props.data.filter((_, i) => i !== index);
        props.setData(newData);
    };

    return (
        <>
            <AutoComplete
                style={{ width: '75%', marginLeft: '20px', marginTop: '20px' }}
                options={options}
                onSearch={handleSearch}
                onSelect={(value) => handleSelect(value)}
            >
                <Input.Search
                    size="large"
                    placeholder="digite o COD, ou descrição do CID 10"
                />
            </AutoComplete>

            <List
                itemLayout="horizontal"
                dataSource={props.data}
                style={{ width: '50%', marginTop: '20px', marginLeft: '20px' }}
                locale={{ emptyText: 'Não existe ainda doença adicionada' }}
                renderItem={(item, index) => (
                    <List.Item
                        actions={[
                            <>
                                <Flex wrap="nowrap">
                                    <CloseSquareOutlined
                                        style={{
                                            color: 'red',
                                            fontSize: '35px',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => handleRemove(index)}
                                    />
                                </Flex>
                            </>,
                        ]}
                    >
                        <List.Item.Meta
                            title={<a href="#">{item.title}</a>}
                            description={item.description}
                        />
                    </List.Item>
                )}
            />
        </>
    );
};

export default Cid10;
