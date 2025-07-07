import { useEffect, useState } from 'react';
import { api } from '../../service/api';
import { format } from 'date-fns';

function RotaTest() {
    const [requisicoes, setRequisicoes] = useState([]);

    useEffect(() => {
        api.get('requisicaoexame/all/composto')
            .then((r) => {
                setRequisicoes([...r.data]);
                console.log(r.data);
            })
            .catch((e) => {});
    }, []);
    return (
        <>
            {requisicoes.map((item) => (
                <div key={item.id}>
                    id: {item.id} <br />
                    medico: {item.medico}
                    <br />
                    paciente: {item.paciente}
                    <br />
                    Data: {format(new Date(item.data), "yyyy-MM-dd")}
                    <br />
                </div>
            ))}
        </>
    );
}

export default RotaTest;
