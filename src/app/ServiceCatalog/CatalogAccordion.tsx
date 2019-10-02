import React, { useState } from 'react';
import { Accordion, AccordionItem, AccordionContent, AccordionToggle, Button } from '@patternfly/react-core';
import { IServiceModel } from '@app/Models/LsmModels';
import { CatalogContent } from './CatalogContent';

export const CatalogAccordion: React.FunctionComponent<{ services: IServiceModel[] }> = (props) => {
  const [expanded, setExpanded] = useState('ex-toggle2');
  let serviceItems;
  if (props.services) {
    serviceItems = props.services.map(service => {
      const toggleId = service.name +'-toggle';
      return (<AccordionItem key={toggleId}>
      <AccordionToggle
      onClick={() => { onToggle(toggleId)}}
      isExpanded={expanded ===  toggleId}
      id={toggleId} >
        {service.name}
      </AccordionToggle>
      <AccordionContent id= {service.name + "-expand"}
          isHidden={expanded !== toggleId}>
            <CatalogContent service={service}/>
      </AccordionContent>
    </AccordionItem>)})
  }

  const onToggle = id => {
    if (id === expanded) {
      setExpanded('');
    } else {
      setExpanded(id);
    }
  }
  return (
    <Accordion asDefinitionList={false}>
      {serviceItems}

      <AccordionItem>
        <AccordionToggle
          onClick={() => { onToggle('ex-toggle2') }}
          isExpanded={expanded === 'ex-toggle2'}
          id="ex-toggle2"
        >
          E-line

          </AccordionToggle>

        <AccordionContent
          id="ex-expand2"
          isHidden={expanded !== 'ex-toggle2'}
        >
          <div style={{ float: 'right' }}>
            <Button variant="primary"> Inventory </Button>
            <Button variant="danger"> Delete </Button>
          </div>
          {/* <SimpleTabs /> */}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem>
        <AccordionToggle
          onClick={() => { onToggle('ex-toggle3') }}
          isExpanded={expanded === 'ex-toggle3'}
          id="ex-toggle3"
        >
          E-lan
          </AccordionToggle>
        <AccordionContent
          id="ex-expand3"
          isHidden={expanded !== 'ex-toggle3'}
        >
          <p>Morbi vitae urna quis nunc convallis hendrerit. Aliquam congue orci quis ultricies tempus.</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

}
