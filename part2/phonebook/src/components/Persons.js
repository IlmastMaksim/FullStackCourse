import React from 'react'

const Persons = (props) => {
    const personsToShow = props.filter === "" 
                                            ? props.persons 
                                            : props.persons.filter(el => 
                                                el.name.toLowerCase().includes(props.filter.toLowerCase())) 
    const content = personsToShow.map((el, i) => <li key={i}>{el.name} {el.number}</li>)
    return (
        <ul>
            {content}
        </ul>
    )
}

export default Persons