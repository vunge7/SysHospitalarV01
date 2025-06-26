import React from 'react';
import { Form, Select } from 'antd';

// import { Container } from './styles';

function Combo(props) {
    const update = (index) => {
        props.onSelect(index);
        props.select(props.options[index].value);
    };

    return (
        <div>
            <Form.Item
                label={props.label}
                name={props.name}
                rules={[
                    {
                        required: props.required,
                        message: props.messageRequired,
                    },
                ]}
                style={{
                    marginBottom: 2,
                    width: 'auto',
                }}
            >
                <Select
                    showSearch
                    placeholder={props.placeHolder}
                    filterOption={(input, option) =>
                        (option?.label ?? '')
                            .toLowerCase()
                            .includes(input.toLowerCase())
                    }
                    options={props.options}
                    style={{
                        width: 200,
                    }}
                    defaultValue={props.value}
                    onSelect={
                        props.onSelect !== undefined
                            ? (index) => update(index)
                            : (index) => {
                                  props.tipo !== undefined
                                      ? props.select(index)
                                      : props.select(
                                            props.options[index].value
                                        );
                              }
                    }
                />
            </Form.Item>
        </div>
    );
}

export default Combo;
